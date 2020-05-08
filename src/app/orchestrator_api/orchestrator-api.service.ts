import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {default as config} from './config';

@Injectable({
  providedIn: 'root'
})
export class OrchestratorApiService {


  errorHandler: (err: any) => Observable<any>;


  constructor(private http: HttpClient) {

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


  orchestration(): Observable<string> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',

      })
    };

    const content = {
      commands: {
        additionalProp1: "string",
        additionalProp2: "string",
        additionalProp3: "string"
      },
      orchestrationFlags: {
        additionalProp1: true,
        additionalProp2: true,
        additionalProp3: true
      },
      preferredProviders: [
        {
          providerCloud: {
            authenticationInfo: "string",
            gatekeeperRelayIds: [
              0
            ],
            gatewayRelayIds: [
              0
            ],
            name: "string",
            neighbor: true,
            operator: "string",
            secure: true
          },
          providerSystem: {
            address: "string",
            authenticationInfo: "string",
            port: 0,
            systemName: "string"
          }
        }
      ],
      requestedService: {
        interfaceRequirements: [
          "string"
        ],
        maxVersionRequirement: 0,
        metadataRequirements: {
          additionalProp1: "string",
          additionalProp2: "string",
          additionalProp3: "string"
        },
        minVersionRequirement: 0,
        pingProviders: true,
        securityRequirements: [
          "NOT_SECURE"
        ],
        serviceDefinitionRequirement: "string",
        versionRequirement: 0
      },
      requesterCloud: {
        authenticationInfo: "string",
        gatekeeperRelayIds: [
          0
        ],
        gatewayRelayIds: [
          0
        ],
        name: "string",
        neighbor: true,
        operator: "string",
        secure: true
      },
      requesterSystem: {
        address: "127.0.0.1",
        authenticationInfo: "testkey",
        port: 5000,
        systemName: "testProvider"
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
    return this.http.get(config.addressData + 'all-data', {observe: 'response'}).pipe(
      tap(data => {
          console.log((JSON.stringify(data)));
        }
      ),

      catchError(this.errorHandler)
    );
  }


  getData(sensorID, city, time_range) {
    return this.http.get(config.addressData + 'formquery/city/' + city + '/sensor-id/' + sensorID + '/time-range/' + time_range).pipe(
      tap(data => console.log((JSON.stringify(data)))),
      catchError(this.errorHandler)
    );
  }

  getCities() {
    return this.http.get(config.addressData + 'city-list').pipe(
      tap(data => console.log((JSON.stringify(data)))),
      catchError(this.errorHandler)
    );
  }

  getSensors() {
    return this.http.get(config.addressData + 'sensor-list').pipe(
      tap(data => console.log((JSON.stringify(data)))),
      catchError(this.errorHandler)
    );
  }

  getSensorsCity(city) {
    return this.http.get(config.addressData + 'city/' + city + '/sensor-list').pipe(
      tap(data => console.log((JSON.stringify(data)))),
      catchError(this.errorHandler)
    );
  }

  saveConfig(option) {
    return this.http.post(config.addressData + 'config-update', option, {observe: 'response'}).pipe(
      tap(data => console.log((JSON.stringify(data)))),
      catchError(this.errorHandler)
    );
  }

  getCoordinates(sensorID, city) {
    return this.http.get(config.addressData + 'city/' + city + '/sensor-id/' + sensorID + '/get-coordinates').pipe(
      tap(data => console.log((JSON.stringify(data)))),
      catchError(this.errorHandler)
    );
  }

  getInitialConfig() {
    return this.http.get(config.addressData + 'get-config').pipe(
      tap(data => console.log((JSON.stringify(data)))),
      catchError(this.errorHandler)
    );
  }

  getTimeZone(lat, lng) {
    return this.http.get('http://api.timezonedb.com/v2.1/get-time-zone?key=AS89CMPR9VFF&format=json&by=position&lat='+lat+'&lng='+lng).pipe(
      tap(data => console.log((JSON.stringify(data)))),
      catchError(this.errorHandler)
    );
  }
}
