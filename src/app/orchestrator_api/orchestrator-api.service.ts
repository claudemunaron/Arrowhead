import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})


export class OrchestratorApiService {


  errorHandler: (err: any) => Observable<any>;
  addressData: string;

  constructor(private http: HttpClient) {
    this.getIP().subscribe((response) => {
      let s = response.split('.');
      if (s[0] && s[0] == 91 && s[1] && s[1] == 218) {
        localStorage.setItem('addressData', 'http://vitalaht.cloud.reply.eu:5000/');
        this.addressData = localStorage.getItem('addressData');
      } else {
        localStorage.setItem('addressData', 'http://91.218.224.188:5000/');
        this.addressData = localStorage.getItem('addressData');
      }
    });

    this.addressData = localStorage.getItem('addressData');
    this.errorHandler = errorHandler;


    function errorHandler(err: HttpErrorResponse) {
      let errorMessage = '';
      if (err instanceof ErrorEvent) {
        errorMessage = ' Error: ' + err.error.message;
      } else {
        errorMessage = 'Error code ' + err.status +
          ' message error: ' + err.message;
      }
      return throwError(errorMessage);
    }
  }


  orchestration(selectedService): Observable<string> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',

      })
    };

    const content = {
      orchestrationFlags: {
        overrideStore: true,
      },

      requestedService: {
        interfaceRequirements: [
          "HTTP-INSECURE-JSON"
        ],
        securityRequirements: [
          "NOT_SECURE"
        ],
        serviceDefinitionRequirement: selectedService,
      },

      requesterSystem: {
        address: "91.218.224.188",
        authenticationInfo: "",
        port: 5000,
        systemName: "cr_test_consumer"
      }
    };

    return this.http.post<any>('http://137.204.57.93:8441/orchestrator/orchestration', content, httpOptions).pipe(
      tap(data => {
        console.log((data));
      }),
      catchError(this.errorHandler)
    );
  }

  /*REQUEST*/

  submitRequest(sensorId) {
    return this.http.get('http://137.204.57.93:8443/serviceregistry/mgmt/' + sensorId, {observe: 'response'}).pipe(
      tap(data => {
        console.log((JSON.stringify(data)));
      }),

      catchError(this.errorHandler)
    );
  }

  getAllData(): Observable<string> {
    this.addressData = localStorage.getItem('addressData');
    return this.http.get(this.addressData + 'all-data', {observe: 'response'}).pipe(
      tap(data => {
          console.log((JSON.stringify(data)));
        }
      ),

      catchError(this.errorHandler)
    );
  }


  getData(sensorID, city, time_range) {
    this.addressData = localStorage.getItem('addressData');
    return this.http.get(this.addressData + 'formquery/city/' + city + '/sensor-id/' + sensorID + '/time-range/' + time_range).pipe(
      tap(data => console.log((JSON.stringify(data)))),
      catchError(this.errorHandler)
    );
  }

  getCities() {
    this.addressData = localStorage.getItem('addressData');
    return this.http.get(this.addressData + 'city-list').pipe(
      tap(data => console.log((JSON.stringify(data)))),
      catchError(this.errorHandler)
    );
  }

  getSensors() {
    this.addressData = localStorage.getItem('addressData');
    return this.http.get(this.addressData + 'sensor-list').pipe(
      tap(data => console.log((JSON.stringify(data)))),
      catchError(this.errorHandler)
    );
  }

  getSensorsCity(city) {
    this.addressData = localStorage.getItem('addressData');
    return this.http.get(this.addressData + 'city/' + city + '/sensor-list').pipe(
      tap(data => console.log((JSON.stringify(data)))),
      catchError(this.errorHandler)
    );
  }

  saveConfig(option) {
    this.addressData = localStorage.getItem('addressData');
    return this.http.post(this.addressData + 'config-update', option, {observe: 'response'}).pipe(
      tap(data => console.log((JSON.stringify(data)))),
      catchError(this.errorHandler)
    );
  }

  getCoordinates(sensorID, city) {
    this.addressData = localStorage.getItem('addressData');
    return this.http.get(this.addressData + 'city/' + city + '/sensor-id/' + sensorID + '/get-coordinates').pipe(
      tap(data => console.log((JSON.stringify(data)))),
      catchError(this.errorHandler)
    );
  }

  getInitialConfig() {
    this.addressData = localStorage.getItem('addressData');
    return this.http.get(this.addressData + 'get-config').pipe(
      tap(data => console.log((JSON.stringify(data)))),
      catchError(this.errorHandler)
    );
  }

  getTimeZone(lat, lng) {
    return this.http.get('http://api.timezonedb.com/v2.1/get-time-zone?key=AS89CMPR9VFF&format=json&by=position&lat=' + lat + '&lng=' + lng).pipe(
      tap(data => console.log((JSON.stringify(data)))),
      catchError(this.errorHandler)
    );
  }

  getErrorList() {
    this.addressData = localStorage.getItem('addressData');
    return this.http.get(this.addressData + 'error-list').pipe(
      tap(data => console.log((JSON.stringify(data)))),
      catchError(this.errorHandler)
    );
  }

  getIP() {
    return this.http.get('https://api.ipify.org/', {responseType: 'text'}).pipe(
      tap(data => console.log((JSON.stringify(data)))),
      catchError(this.errorHandler)
    );
  }
}
