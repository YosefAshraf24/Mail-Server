import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: []
})
export class LoginComponent implements OnInit {
  name: string = "";
  password: string = "";
  mail: string = "";
  constructor(private api: ApiService, private router: Router) {
  }

  ngOnInit(): void {
    this.api.currentmail.subscribe(mail => {
      this.mail = mail;
      this.check();
    });
  }
  login() {
    this.api.post("login", this.name + " " + this.password, null);
  }
  check() {
    if (this.mail == "wrong") {

      var elements = document.getElementsByClassName('login__icon');
      for (var i = 0; i < elements.length; i++) {
        (elements[i] as HTMLElement).style.color = "red";
      }
      elements = document.getElementsByClassName('login__input');
      for (var i = 0; i < elements.length; i++) {
        (elements[i] as HTMLElement).style.borderBottomColor = "red";
      }

    }
    else if (localStorage.getItem("user") != null) {
      this.router.navigate(['mail']);
    }
  }
  routeSignup() {
    this.router.navigate(['signup']);
  }
}
