import {Component, OnInit} from '@angular/core';
import {NotifierService} from 'angular-notifier';
import {Router} from "@angular/router";
import {FormControl, Validators} from '@angular/forms';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
  pass = '';
  user = '';
  username = new FormControl('', [Validators.required]);
  password = new FormControl('', [Validators.required]);
  private readonly notifier: NotifierService;

  constructor(public router: Router, notifierService: NotifierService) {
    this.notifier = notifierService;
  }

  ngOnInit() {

  }

  getErrorMessage() {
    if (this.username.hasError('required') || this.password.hasError('required')) {
      return '*You must enter a valid value';
    }
  }

  login() {
    if (this.user.toString() === 'admin' && this.pass.toString() === 'admin') {
      this.router.navigate(['/Home', {}]);
    } else {
      this.notifier.notify('error', 'Error:  Invalid username or password');
    }
  }
}
