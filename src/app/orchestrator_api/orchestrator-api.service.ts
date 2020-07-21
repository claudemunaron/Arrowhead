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


  async getData(sensorID, city, time_range) {
    this.addressData = localStorage.getItem('addressData');
    return this.http.get(this.addressData + 'formquery/city/' + city + '/sensor-id/' + sensorID + '/time-range/' + time_range).pipe(
      tap(data => console.log((JSON.stringify(data)))),
      catchError(this.errorHandler)
    );
  }

  async getMultiQuery(query, time_range) {
    this.addressData = localStorage.getItem('addressData');
    return await this.http.get(this.addressData + 'multiplequery/city-sensorid/' + query + '/time-range/' + time_range).toPromise();
  }

  async getCities() {
    this.addressData = localStorage.getItem('addressData');
    return await this.http.get(this.addressData + 'city-list').toPromise();
  }

  async getSensors() {
    this.addressData = localStorage.getItem('addressData');
    return await this.http.get(this.addressData + 'sensor-list').toPromise();
  }

  async getInitialConfig() {
    this.addressData = localStorage.getItem('addressData');
    return await this.http.get(this.addressData + 'get-config').toPromise();
  }

  async getCoordinates(sensorID, city) {
    this.addressData = localStorage.getItem('addressData');
    return await this.http.get(this.addressData + 'city/' + city + '/sensor-id/' + sensorID + '/get-coordinates').toPromise();
  }

  async registration(name, surname, company, role, email, passaword) {
    this.addressData = localStorage.getItem('addressData');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',

      })
    };
    const content = {
      email: email,
      password: passaword,
      first_name: name,
      last_name: surname,
      company: company,
      role: role
    };
    return await this.http.post(this.addressData + 'register', content, httpOptions).toPromise();
  }

  async login(email, passaword) {
    this.addressData = localStorage.getItem('addressData');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',

      })
    };
    const content = {
      email: email,
      password: passaword,
    };
    return await this.http.post(this.addressData + 'login', content, httpOptions).toPromise();
  }

  async getTimeZone(lat, lng) {
    return await this.http.get('http://api.timezonedb.com/v2.1/get-time-zone?key=AS89CMPR9VFF&format=json&by=position&lat=' + lat + '&lng=' + lng).toPromise();
  }

  getSensorsCity(city) {
    this.addressData = localStorage.getItem('addressData');
    return this.http.get(this.addressData + 'city/' + city + '/sensor-list').pipe(
      tap(data => console.log((JSON.stringify(data)))),
      catchError(this.errorHandler)
    );
  }

  getCitiesSensor(sensor) {
    this.addressData = localStorage.getItem('addressData');
    return this.http.get(this.addressData + 'sensor-id/' + sensor + '/city-list').pipe(
      tap(data => console.log((JSON.stringify(data)))),
      catchError(this.errorHandler)
    );
  }


  getService() {
    this.addressData = localStorage.getItem('addressData');
    return this.http.get(this.addressData + '/service-list').pipe(
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

  delete(city, sensorID) {
    this.addressData = localStorage.getItem('addressData');
    return this.http.delete(this.addressData + '/service-delete/city/' + city + '/sensor-id/' + sensorID).pipe(
      tap(data => console.log((JSON.stringify(data)))),
      catchError(this.errorHandler)
    );
  }

  async minData(sensorID: any, city?: any, time_range?: any) {
    this.addressData = localStorage.getItem('addressData');
    return await this.http.get(this.addressData + 'mindata/sensor-id/' + sensorID).toPromise();
    //return await this.http.get(this.addressData + 'mindata/city/' + city + '/sensor-id/' + sensorID + '/time-range/' + time_range).toPromise();

  }

  async avgData(sensorID: any, city?: any, time_range?: any) {
    this.addressData = localStorage.getItem('addressData');
    return await this.http.get(this.addressData + 'avgdata/sensor-id/' + sensorID).toPromise();
    // return await this.http.get(this.addressData + 'avgdata/city/' + city + '/sensor-id/' + sensorID + '/time-range/' + time_range).toPromise();
  }

  async maxData(sensorID: any, city?: any, time_range?: any) {
    this.addressData = localStorage.getItem('addressData');
    return await this.http.get(this.addressData + 'maxdata/sensor-id/' + sensorID).toPromise();
    //return await this.http.get(this.addressData + 'maxdata/city/' + city + '/sensor-id/' + sensorID + '/time-range/' + time_range).toPromise();

  }
}
