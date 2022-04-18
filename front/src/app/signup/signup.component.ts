import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  name: string = "";
  password: string = "";
  confpassword: string = "";
  message: string[] = [""];
  constructor(private api: ApiService, private router: Router, private route: ActivatedRoute,) {
  }

  ngOnInit(): void {
  }
  signup() {
    let inputs = document.getElementsByClassName("login__input");
    for (let i = 0; i < inputs.length; i++)
      if ((inputs[i] as HTMLInputElement).value == "") {
        this.message[0] = "all fields must be filled";
        return;
      }

    this.api.post("signup", this.name + " " + this.password, this.message);
  }
  samePass() {
    if (this.password != this.confpassword) {
      (document.getElementById("message") as HTMLElement).innerText = "❌";
    }
    else {
      (document.getElementById("message") as HTMLElement).innerText = "✅";
    }
  }


}
