import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from "./login/login.component";
import {HomeComponent} from "./home/home.component";
import {OrchestratorApiService} from "./orchestrator_api/orchestrator-api.service";

import {LoginAdminComponent} from "./login-admin/login-admin.component";

const routes: Routes = [
  {path: 'Home', component: HomeComponent},
  {path: 'Login', component: LoginComponent},
  {path: 'Login-Admin', component: LoginAdminComponent},
  {path: '', redirectTo: '/Login', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
  constructor(private orchestrator: OrchestratorApiService) {
    this.orchestrator.getIP().subscribe((response) => {
      let s = response.split('.');
      if (s[0] && s[0] == 91 && s[1] && s[1] == 218) {
        localStorage.setItem('addressData', 'http://vitalaht.cloud.reply.eu:5000/');
      } else {
        localStorage.setItem('addressData', 'http://91.218.224.188:5000/');
      }
    });
  }
}
