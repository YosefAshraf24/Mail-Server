import { Component, Input, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MailComponent implements OnInit {
  @Input() mail: string = "";

  check: any = [];
  star: any = [];
  state: string = "inbox";
  selectedFiles: any;
  currentFile: any;
  filter: any;
  constructor(private api: ApiService, public router: Router) {
    if (localStorage.getItem("user") == null) {
      this.router.navigate(['']);
    }
  }

  ngOnInit(): void {
    if (localStorage.getItem("user") == null) {
      this.router.navigate(['']);
    }
    this.buildPage();
    this.generate();
    if (localStorage.getItem("state") != null)
      (document.getElementById(localStorage.getItem("state")!) as HTMLLIElement).click();
    (document.getElementById("close") as HTMLElement).addEventListener("click", (e) => {
      e.stopPropagation();
      const formData: FormData = new FormData();
      let receiver = (document.querySelector("#mailreciver") as HTMLInputElement).value;
      let subject = (document.querySelector("#mailsubject") as HTMLInputElement).value;
      let mailBody = (document.querySelector("#mailbody") as HTMLInputElement).value;
      if (receiver != "" || subject != "" || mailBody != " " || typeof (this.selectedFiles) != "undefined") {
        let all = localStorage.getItem("user") + "$" + receiver + "$" +
          subject + "$" +
          mailBody + "$";
        if (typeof (this.selectedFiles) != "undefined") {
          for (let i = 0; i < this.selectedFiles.length; i++) {
            if (i == this.selectedFiles.length - 1)
              all += this.selectedFiles[i].name
            else
              all += this.selectedFiles[i].name + "#";
            this.currentFile = this.selectedFiles.item(i);
            formData.append('file', this.currentFile);
          }
        }

        const blob = new Blob([all], { type: 'text/plain' })
        formData.append('file', blob, 'metaData.json')
        this.api.post("draft", formData, null);
      }
      location.reload();
    });
  }
  buildPage() {
    let folders = localStorage.getItem("folders")?.split(", ");
    if (typeof (folders) == "undefined") return;
    for (let i = 0; i < folders!.length; i++) {
      if (folders![i] != "draft" && folders![i] != "inbox" && folders![i] != "sent" && folders![i] != "trash" && folders![i] != "starred") {
        let c = document.createElement("DIV");
        c.setAttribute("id", folders![i]);
        c.setAttribute("class", "sidebarOption");
        c.innerHTML = `<span class="material-icons"> folder </span><h3>${folders![i]}</h3>`;
        c.addEventListener("click", () => {
          this.show(folders![i]);
          this.state = folders![i];
        });
        c.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          let file = prompt("delete(d) / rename(r)");
          switch (file) {
            case "r":
              let newName = prompt("Enter New Name:");
              this.api.post("renameFile", folders![i] + "$" + newName + "$" + localStorage.getItem("user"), null);
              break;
            case "d":
              this.api.post("deleteFile", folders![i] + "$" + localStorage.getItem("user"), null);
              break;
          }
        });
        (document.getElementById("add") as HTMLElement).parentNode?.insertBefore(c, (document.getElementById("add") as HTMLElement));
      }

    }

  }
  newFolder() {
    let name = prompt("Enter Folder Name:");
    this.api.post("addFile", name + "$" + localStorage.getItem("user"), null);
  }
  hide() {
    if ((document.getElementById("compose") as HTMLElement).style.width == "500px") {
      (document.getElementById("compose") as HTMLElement).style.width = "180px";
      (document.getElementById("compose") as HTMLElement).style.bottom = "-270px";
      (document.getElementById("minimize") as HTMLElement).innerText = "fullscreen"
    } else {
      (document.getElementById("compose") as HTMLElement).style.width = "500px";
      (document.getElementById("compose") as HTMLElement).style.bottom = "0px";
      (document.getElementById("minimize") as HTMLElement).innerText = "minimize"
    }
  }
  chooseSearch() {
    if ((document.getElementById("searchOptions") as HTMLElement).style.display == "inherit")
      (document.getElementById("searchOptions") as HTMLElement).style.display = "none";
    else
      (document.getElementById("searchOptions") as HTMLElement).style.display = "inherit";

  }
  setFilter(s: string) {
    this.filter = s;
    (document.getElementById("searchOptions") as HTMLElement).style.display = "none";
  }
  generate() {
    let mailList = document.getElementsByClassName("emailList__list");
    if (typeof (mailList[0]) == "undefined") return;
    mailList[0].innerHTML = "";
    this.filter = "";

    if (localStorage.getItem("mail") == "") return;
    let mailJSON = JSON.parse(localStorage.getItem("mail")!);
    for (let i in mailJSON) {
      let node = document.createElement("DIV");
      node.classList.add("emailRow");
      let options = document.createElement("DIV");
      options.classList.add("emailRow__options");
      let checkbox = document.createElement("INPUT");
      checkbox.setAttribute("type", "checkbox");
      checkbox.addEventListener("click", (e) => {
        if ((checkbox as HTMLInputElement).checked)
          this.check.push(mailJSON[i]);
        else
          this.check.pop(mailJSON[i]);
        e.stopPropagation();
        if (this.check.length != 0)
          this.showBulkOptions();
        else
          this.HideBulkOptions();
      });
      options.appendChild(checkbox);
      if (localStorage.getItem("state") != "trash") {
        let star = document.createElement("SPAN");
        star.setAttribute("class", "material-icons");
        star.setAttribute("id", "star");
        star.innerText = (mailJSON[i]["starred"] == "true" ? "star" : "star_border");
        star.addEventListener("click", (e) => {
          if (star.innerText == "star") {
            star.innerText = "star_border";
            star.classList.remove("selected");
            this.api.post("unstar", "[" + JSON.stringify(mailJSON[i]) + "]" + "$" + localStorage.getItem("state") + "$" + localStorage.getItem("user"), null);
          }
          else {
            star.innerText = "star";
            star.classList.add("selected");
            this.api.post("star", "[" + JSON.stringify(mailJSON[i]) + "]" + "$" + this.state, null);
          }
          e.stopPropagation();
        });
        options.appendChild(star);
      }
      if (localStorage.getItem("state") != "starred") {
        var trash = document.createElement("SPAN");
        trash.setAttribute("id", "trashh");
        trash.addEventListener("click", (e) => {
          this.api.post((localStorage.getItem("state") == "trash" ? "deletetrash" : "delete"), "[" + JSON.stringify(mailJSON[i]) + "]" + "$" + (localStorage.getItem("state") == "trash" ? localStorage.getItem("user") : this.state), null);
          e.stopPropagation();
        });
        trash.setAttribute("class", "material-icons");
        trash.innerText = localStorage.getItem("state") == "trash" ? "delete_forever" : "delete";
        options.appendChild(trash);
      }


      node.appendChild(options);
      var title = document.createElement("H3");
      title.classList.add("emailRow__title");
      title.innerText = mailJSON[i]["subject"];
      node.appendChild(title);
      var mailBody = document.createElement("DIV");
      mailBody.classList.add("emailRow__message");
      var body = document.createElement("H4");
      body.innerText = (mailJSON[i]["body"] + "").substring(0, 20);
      body.innerHTML += `<span class="emailRow__description" style="text-overflow: ellipsis;">${(mailJSON[i]["body"] + "").substring(20, 60)}</span>`;
      mailBody.appendChild(body);
      node.appendChild(mailBody);
      var time = document.createElement("P");
      time.classList.add("emailRow__time");
      time.innerText = mailJSON[i]["time"];
      node.appendChild(time);
      if (localStorage.getItem("state") != "draft") {
        node.addEventListener("click", (e) => {
          this.create(mailJSON[i]);
        });
      } else {
        node.addEventListener("click", (e) => {
          this.continueCompose(JSON.stringify(mailJSON[i]), JSON.stringify(mailJSON[i]["to"]), JSON.stringify(mailJSON[i]["subject"]), JSON.stringify(mailJSON[i]["body"]));
        });
      }

      mailList[0].appendChild(node);
    }
  }
  continueCompose(m: string, r: string, s: string, b: string) {
    let form = (document.querySelector("#compose") as HTMLElement);
    if (form.style.display == "none") {
      form.style.display = "inherit";
    }
    (document.querySelector("#mailreciver") as HTMLInputElement).value = r;
    (document.querySelector("#mailsubject") as HTMLInputElement).value = s;
    (document.querySelector("#mailbody") as HTMLInputElement).value = b;
    this.api.post("deleteDraft", "[" + m + "]" + "$" + localStorage.getItem("user"), null);
  }
  showBulkOptions() {
    (document.getElementById("bulkOptions") as HTMLElement).style.display = "inherit";
  }
  HideBulkOptions() {
    (document.getElementById("bulkOptions") as HTMLElement).style.display = "none";
  }
  selectall() {
    let checkbox = document.getElementById("selectall");
    let checkboxes = document.getElementsByTagName('input');
    if ((checkbox as HTMLInputElement).checked) {
      for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].type == "checkbox" && !(checkboxes[i] as HTMLInputElement).checked)
          (checkboxes[i] as HTMLInputElement).click();
      }
    }
    else {
      for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].type == "checkbox" && (checkboxes[i] as HTMLInputElement).checked)
          (checkboxes[i] as HTMLInputElement).click();
      }
    }
  }
  trashSelected() {
    this.api.post((localStorage.getItem("state") == "trash" ? "deletetrash" : "delete"), JSON.stringify(this.check) + "$" + (localStorage.getItem("state") == "trash" ? localStorage.getItem("user") : this.state), null);
  }
  starSelected() {
    let star = document.getElementById("starSelected");
    let stars = document.querySelectorAll("#star");
    if (star?.classList.contains("selected")) {
      for (let i = 0; i < stars.length; i++) {
        if ((stars[i].previousElementSibling as HTMLInputElement).checked && (stars[i] as HTMLInputElement).innerText == "star")
          (stars[i] as HTMLInputElement).innerText = "star_border";
      }
      star!.innerText = "star_border";
      this.api.post("unstar", JSON.stringify(this.check) + "$" + localStorage.getItem("state") + "$" + localStorage.getItem("user"), null);
    }
    else {
      for (let i = 0; i < stars.length; i++) {
        if ((stars[i].previousElementSibling as HTMLInputElement).checked && (stars[i] as HTMLInputElement).innerText != "star")
          (stars[i] as HTMLInputElement).innerText = "star";
      }
      star!.innerText = "star";
      this.api.post("star", JSON.stringify(this.check) + "$" + this.state, null);
    }
    star?.classList.toggle("selected");
  }
  create(s: string) {
    let mailJSON = JSON.parse(JSON.stringify(s));

    let d = document.querySelector("#view");
    (d as HTMLElement).innerHTML = `<h1>${mailJSON["subject"]}</h1>
    <br>
    <h4>from:${mailJSON["from"]}</h4>
    <h4>to:${mailJSON["to"]}</h4>
    <br>
    <h3>${mailJSON["body"]}</h3>`;
    let filesName = (mailJSON["file"] + "").split("#");
    for (let i in filesName)
      (d as HTMLElement).innerHTML += `<button (click)="this.ds.download('file.txt')">${i}</button>
`;

    (d as HTMLElement).style.display = "inherit";
    (document.getElementsByClassName("emailList__list")[0] as HTMLElement).style.display = "none";
  }
  reload() {
    window.location.reload();
  }
  // hide(e: MouseEvent) {
  //   if (((e.clientX > 1500 || e.clientX < 360) || (e.clientY > 740 || e.clientY < 400))) {
  //     if (typeof ((document.getElementById("compose") as HTMLLIElement).style.display) == "undefined") return;
  //     (document.getElementById("compose") as HTMLLIElement).style.display = "none";
  //   }

  // }
  showCompose(e: any) {
    e.stopPropagation();
    let form = (document.querySelector("#compose") as HTMLElement);
    if (form.style.display == "none") {
      form.style.display = "inherit";
    }
    // (document.getElementsByTagName("BODY")[0] as HTMLElement).addEventListener("click", this.hide);
  }
  send() {
    const formData: FormData = new FormData();
    let receiver = (document.querySelector("#mailreciver") as HTMLInputElement).value;
    let subject = (document.querySelector("#mailsubject") as HTMLInputElement).value;
    let mailBody = (document.querySelector("#mailbody") as HTMLInputElement).value;
    if (receiver == "") {
      alert("'To' filed can't be empty");
      return;
    } else if (subject == "") {
      alert("'subject' filed can't be empty");
      return;
    }
    let all = localStorage.getItem("user") + "$" + receiver + "$" +
      subject + "$" +
      mailBody + "$";
    if (typeof (this.selectedFiles) != "undefined") {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        if (i == this.selectedFiles.length - 1)
          all += this.selectedFiles[i].name
        else
          all += this.selectedFiles[i].name + "#";
        this.currentFile = this.selectedFiles.item(i);
        formData.append('file', this.currentFile);
      }
    }

    const blob = new Blob([all], { type: 'text/plain' })
    formData.append('file', blob, 'metaData.json')
    this.api.post("send", formData, null);
  }

  show(s: string) {
    localStorage.setItem("state", s);
    this.api.post("mails", localStorage.getItem("user") + " " + s, null);
    this.api.currentmail.subscribe(mail => {
      this.mail = mail;
      this.generate();
      if (typeof ((document.getElementsByClassName("emailList__list")[0] as HTMLElement)) == "undefined") return;
      (document.getElementsByClassName("emailList__list")[0] as HTMLElement).style.display = "initial";
      (document.querySelector("#view") as HTMLElement).style.display = "none";
    });
    for (let i = 0; i < document.getElementsByClassName("sidebarOption").length; i++)
      document.getElementsByClassName("sidebarOption")[i].classList.remove("sidebarOption__active");

    document.querySelector("#" + s)?.classList.add("sidebarOption__active");
  }


  selectFile(event: any) {
    this.selectedFiles = event.target.files;
  }
  logout() {
    localStorage.clear();
    this.router.navigate(['']);
  }
  search() {
    console.log(this.filter);
    if (this.filter == "") {
      this.api.get("search", localStorage.getItem("mail"), (document.getElementById("searchIn") as HTMLInputElement).value, null);
    } else {
      this.api.get("filter", localStorage.getItem("mail"), (document.getElementById("searchIn") as HTMLInputElement).value, this.filter);
    }
  }
  showsortoptions() {
    if ((document.getElementById("sortoptions") as HTMLElement).style.display == "inherit")
      (document.getElementById("sortoptions") as HTMLElement).style.display = "none";
    else
      (document.getElementById("sortoptions") as HTMLElement).style.display = "inherit";

  }
  sort(s: string) {
    this.api.get("sort", localStorage.getItem("mail"), s, null);
  }

}