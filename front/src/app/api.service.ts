import { Injectable } from '@angular/core';
import {
  environment
} from '../environments/environment';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private static mail = new BehaviorSubject<string>("");
  currentmail = ApiService.mail.asObservable();

  httpOptions: any;
  constructor(private http: HttpClient, private router: Router) {
    this.httpOptions = { headers: new HttpHeaders({}), responseType: 'text' };
  }
  changemail(mail: string) {
    ApiService.mail.next(mail);
  }

  post(path: String, body: any, temp: any) {
    if (path == "deletetarsh") {
      this.http.post(`${environment.url}${path}`, body, this.httpOptions).subscribe((request) => {
        location.reload();
      });
      return;
    }
    else if (path == 'send') {
      this.http.post(`${environment.url}${path}`, body, this.httpOptions).subscribe((request) => {
        if (request + "" == " ") {
          alert("Sent");
          location.reload();
        } else {
          alert(request);
        }
      });
      return;
    }
    else if (path == 'draft') {
      this.http.post(`${environment.url}${path}`, body, this.httpOptions).subscribe((request) => {
        alert("drafted");
        location.reload();
      });
      return;
    }
    else {
      this.http.post(`${environment.url}${path}`, body, this.httpOptions).subscribe((request) => {
        if (path == "deleteDraft") {
          window.location.reload();
        } else if (path == "mails") {
          let x = (request + "").split("$");
          localStorage.setItem("mail", x[0]);
          this.changemail(x[0] + "");
          localStorage.setItem("folders", x[1]);
        } else if (path == "login") {
          localStorage.setItem("user", (body + "").substring(0, (body + "").indexOf(" ")));
          localStorage.setItem("mail", request + "");
          localStorage.setItem("state", "inbox");
          this.changemail(request + "");

        } else if (path == "signup") {
          temp[0] = request;
          if (request + "" == "done") {
            this.router.navigate(['']);
          }
        } else if (path == "delete" || path == "star" || path == "unstar" || path == "addFile") {
          location.reload();
        }


      });
    }
  }
  get(path: String, body: any, temp: any, filter: any) {
    if (path == "search" || path == "sort") {
      const params = new HttpParams().set("mails", body).set("value", temp);
      this.http.get(`${environment.url}${path}`, { params: params }).subscribe((re) => {
        localStorage.setItem("mail", JSON.stringify(re) + "");
        this.changemail(re + "");
      });
    } else if (path == "filter") {
      const params = new HttpParams().set("mails", body).set("value", temp).set("criteria", filter);
      this.http.get(`${environment.url}${path}`, { params: params }).subscribe((re) => {
        localStorage.setItem("mail", JSON.stringify(re) + "");
        this.changemail(re + "");
      });
    }

  }
  // downloadFile(): any {
  //   return this.http.post(`${environment.url}download`, "lll", { headers: new HttpHeaders({}), responseType: 'multipart/form-data' }).subscribe((request) => {
  //     console.log(request);
  //   });
  // }
}
