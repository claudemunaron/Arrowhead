import {Component, Inject, OnInit} from '@angular/core';
import {NotifierService} from 'angular-notifier';
import {Router} from "@angular/router";
import {FormControl, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {OrchestratorApiService} from "../orchestrator_api/orchestrator-api.service";

export interface DialogData {
  name: string;
  surname: string;
  company: string;
  pass: string;
  email: string;
  role: string;
  cpass: string;
}

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

  name: string;
  surname: string;
  company: string;
  passw: string;
  email: string;
  role: string;
  cpass: string;

  constructor(private orchestrator: OrchestratorApiService, public router: Router, notifierService: NotifierService, public dialog: MatDialog) {
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
    this.orchestrator.login(this.user.toString(), this.pass.toString()).then(
      (response: any) => {
        if (response && response.token) {
          this.router.navigate(['/Home', {}]);
        } else {
          this.notifier.notify('error', 'Error:  Invalid username or password');
        }
      }
    )
    /* if (this.user.toString() === 'admin' && this.pass.toString() === 'admin') {

     } else {
       this.notifier.notify('error', 'Error:  Invalid username or password');
     }*/
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(RegistrationDialog, {
      minWidth: '350px',
      data: {
        name: this.name,
        surname: this.surname,
        company: this.company,
        role: this.role,
        email: this.email,
        pass: this.passw,
        cpass: this.cpass
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.orchestrator.registration(result.name, result.surname, result.company, result.role, result.email, result.pass)
        .then((response: any) => {
          alert(JSON.stringify(response));
          if (response && response.id) {
            this.notifier.notify('success', 'Success: Registration was successful');
          } else {
            this.notifier.notify('error', 'Error: Registration failed');
          }
        });
    });
  }
}

@Component({
  selector: 'registration-dialog',
  templateUrl: 'registration-dialog.html',
  styleUrls: ['./login.component.scss']
})
export class RegistrationDialog {

  constructor(
    public dialogRef: MatDialogRef<RegistrationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
