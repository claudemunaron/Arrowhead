import {Component} from '@angular/core';
import {OrchestratorApiService} from "./orchestrator_api/orchestrator-api.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'arrowhead';

  constructor(private orchestrator: OrchestratorApiService) {
    orchestrator.getIP().subscribe((response) => {
      let s = response.split('.');
      if (s[0] && s[0] == 91 && s[1] && s[1] == 218) {
        localStorage.setItem('addressData', 'http://vitalaht.cloud.reply.eu:5000/');
      } else {
        localStorage.setItem('addressData', 'http://91.218.224.188:5000/');
      }
    });
  }
}
