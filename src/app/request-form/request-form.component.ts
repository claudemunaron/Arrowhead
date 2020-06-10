import {AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {OrchestratorApiService} from "../orchestrator_api/orchestrator-api.service";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {NotifierService} from "angular-notifier";
import {ChartVisualizationComponent} from "../chart-visualization/chart-visualization.component";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";

export interface DialogData {
  animal: string;
  name: string;
  selectedPType: string;
  selectedService: string;
  selectedLocation: string;
}

@Component({
  selector: 'app-request-form',
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.scss']
})
export class RequestFormComponent implements OnInit, AfterViewInit {

  /*char variables*/
  @ViewChild(ChartVisualizationComponent) charChild;

  ELEMENT_DATA: any[] = [];


  displayedColumns: string[] = ['Sensor_ID', 'Sensor_Name', 'Site_ID', 'Meas_Unit', 'Visual'];
  dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  /*Request form*/
  selectedPType = 'mqtt';
  selectedLocation = 'to';
  selectedService = 'vital_co2_sensor';
  requestResponse: any;

  responseFormGroup: FormGroup;

  options: any = [];
  checkedElement: any[] = [];
  savedElement: any[] = [];
  parentMessage: string;

  date: any = new FormControl(new Date());
  dateFrom: string;
  dateTo: string;

  /*Response data*/

  response: any;
  initialConfig: any;
  cities: string[] = [];
  sensors: string[] = [];
  services: any[] = [];
  filter: { sName, city, dF, dT, hF, hT } = {sName: "", city: "", dF: "", dT: "", hF: "", hT: ""};


  /*grapic variables*/

  showPanel: boolean = false;
  panelOpenState = false;
  @ViewChild('mapContainer') gmap: ElementRef;


  /*MAPS*/
  map: google.maps.Map;
  lat = 0;
  lng = 0;
  coordinates = new google.maps.LatLng(this.lat, this.lng);
  mapOptions: google.maps.MapOptions = {
    center: this.coordinates,
    zoom: 8,
  };
  marker = new google.maps.Marker({
    position: this.coordinates,
    map: this.map,
  });
  public readonly notifier: NotifierService;


  constructor(private orchestrator: OrchestratorApiService, private formBuilder: FormBuilder, public dialog: MatDialog,
              notifierService: NotifierService) {
    this.notifier = notifierService;

    this.orchestrator.getIP().subscribe((response) => {
      let s = response.split('.');
      if (s[0] && s[0] == 91 && s[1] && s[1] == 218) {
        localStorage.setItem('addressData', 'http://vitalaht.cloud.reply.eu:5000/');
      } else {
        localStorage.setItem('addressData', 'http://91.218.224.188:5000/');
      }

      this.orchestrator.getInitialConfig().subscribe(response => {
          this.initialConfig = response;
          this.initConfig();
          this.initService();
        },
        (error) => {
          console.log(error);
        });
    });
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.parentMessage = "";
    this.responseFormGroup = this.formBuilder.group({
      selected: this.formBuilder.array([])
    });
  }

  ngAfterViewInit() {
    this.mapInitializer();
  }

  receiveMessageLA($event) {
    this.lat = $event;
    //this.changeMapCoordinates();
  }

  receiveMessageLO($event) {
    this.lng = $event;
    this.changeMapCoordinates();
  }


  changeMapCoordinates() {
    this.coordinates = new google.maps.LatLng(this.lat, this.lng);
    this.mapOptions = {
      center: this.coordinates,
      zoom: 8,
    };

    this.marker = new google.maps.Marker({
      position: this.coordinates,
      map: this.map,
    });

    this.map.setCenter(this.coordinates);
    this.marker.setPosition(this.coordinates);
  }

  mapInitializer() {
    this.map = new google.maps.Map(this.gmap.nativeElement,
      this.mapOptions);
    this.marker.setMap(this.map);
  }


  initConfig() {
    if (this.initialConfig.result && this.initialConfig.result.length > 0) {
      this.lat = this.initialConfig.result[0].FE_Latitude;
      this.lng = this.initialConfig.result[0].FE_Longitude;
      this.changeMapCoordinates();
      this.showPanel = true;
    }
  }


  initService() {

    this.orchestrator.getService().subscribe(resp => {
        let s = resp;
        this.services = s.result;
        this.ELEMENT_DATA = [...this.services];
        this.dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);
        this.dataSource.paginator = this.paginator;
      },
      (error) => {
        console.log(error);
      });
  }

  onChange(event) {
    const selected = <FormArray>this.responseFormGroup.get('selected') as FormArray;
    if (event.checked) {
      selected.push(new FormControl(event.source.value));
      this.checkedElement.push((event.source.value));
      console.log(this.checkedElement);
    } else {
      const i = selected.controls.findIndex(x => x.value === event.source.value);
      selected.removeAt(i);
      this.checkedElement.splice(i, 1);
    }
  }

  submitRequest() {
    this.options = [];
    this.checkedElement = [];

    /*this.orchestrator.submitRequest(this.selectedSID)
      .subscribe(response => {
          this.notifier.notify('success', "Your request has been successfully submitted. ");
          this.requestResponse = response.body;
          console.log(this.requestResponse);
          let exists = !!this.options.find(x => x.id === this.requestResponse.id);

          if (!exists) {
            this.options.push(this.requestResponse);
          }
        },
        (error) => {
          this.notifier.notify('error', " " + error);
        })*/

    this.orchestrator.orchestration(this.selectedService)
      .subscribe(response => {
          this.notifier.notify('success', "Your request has been successfully submitted. ");
          this.requestResponse = response;
          for (let r of this.requestResponse.response) {
            this.options.push(r);
          }

        },
        (error) => {
          this.notifier.notify('error', " " + error);
        })
  }


  save() {
    this.savedElement = [...this.checkedElement];
    if (this.savedElement.length > 0) {
      for (let s of this.savedElement) {
        let optionBody = this.options.filter(
          (o) =>
            o.metadata.FE_Sensor_ID == s.FE_Sensor_ID && o.metadata.FE_Site_ID == s.FE_Site_ID
        );
        this.postUpdate(optionBody[0]);
      }
    } else {
      this.notifier.notify('warning', 'Warning: no element selected');
    }
  }


  postUpdate(toConfig) {
    this.orchestrator.saveConfig(toConfig)
      .subscribe(response => {
          this.response = response.body;
          if (this.response.inserted_object_id) {
            this.showPanel = true;
            this.panelOpenState = !this.panelOpenState;
            this.charChild.getCities();
            let sensor = toConfig.metadata.FE_Sensor_ID;
            let city = toConfig.metadata.FE_Site_ID;
            this.charChild.changeConfig(city, sensor);
            this.getCities();

            this.notifier.notify('success', 'Success: ' + this.response.message);
          } else {
            this.notifier.notify('error', 'Data not saved: ' + this.response.message);
          }
        },
        err => {
          console.log(err);
          this.notifier.notify('error', 'Data not saved ');
        }
      )
  }

  visualizeData(sensor, city) {
    this.showPanel = true;
    this.panelOpenState = !this.panelOpenState;
    this.charChild.changeConfig(city, sensor);

  }


  getCities() {
    this.orchestrator.getCities()
      .subscribe(response => {
          this.response = response;
          this.cities = [...this.response.result];
        }
      ),
      err => {
        console.log('Error in get!');
      };
  }

  getSensors() {
    this.orchestrator.getSensors()
      .subscribe(response => {
          this.response = response;
          this.sensors = [...this.response.result];
        }
      ),
      err => {
        console.log('Error in get!');
      };
  }

  getCurrentDayTimeStamp() {
    let currentData = new Date();
    let year = currentData.getFullYear();
    let month = currentData.getMonth() + 1;
    let day = currentData.getUTCDate();

    let hour = 0;
    let minute = 0;
    let second = 0;
    let hourS = 23;
    let minuteS = 59;
    let secondS = 59;
    let start = this.getUnixTimeStamp(year, month, day, hour, minute, second);
    let stop = this.getUnixTimeStamp(year, month, day, hourS, minuteS, secondS);
    return start + '_' + stop;
  }

  getUnixTimeStamp(year, month, day, hour, minute, second) {
    let datum = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    return datum.getTime() / 1000;
  }


  /*DIALOG*/


  openDialog(): void {
    const dialogRef = this.dialog.open(RequestDialog, {
      width: '40%',
      height: '60%',

      data: {name: 'name', animal: 'animal'}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.initService();
      //this.showPanel = true;
      // this.panelOpenState = !this.panelOpenState;
      this.charChild.getCities();
      this.getCities();

      let sensor = result.sensor;
      let city = result.city;
      let data = {city: city, sensor: sensor};
      this.charChild.changeConfig(city, sensor);


    });
  }
}


@Component({
  selector: 'request-dialog',
  templateUrl: 'requestDialog.html',
  styleUrls: ['./request-form.component.scss']
})
export class RequestDialog {
  options: any = [];
  checkedElement: any[] = [];
  savedElement: any[] = [];
  public readonly notifier: NotifierService;

  isLinear = true;
  responseFormGroup: FormGroup;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  /*Request form*/
  selectedPType = 'mqtt';
  selectedLocation = 'to';
  selectedService = 'vital_no2_sensor';
  requestResponse: any;
  response: any;


  constructor(private orchestrator: OrchestratorApiService, notifierService: NotifierService,
              private formBuilder: FormBuilder,
              public dialogRef: MatDialogRef<RequestDialog>, @Inject(MAT_DIALOG_DATA) public data: DialogData, private _formBuilder: FormBuilder) {

    this.notifier = notifierService;
  }


  ngOnInit() {
    this.responseFormGroup = this.formBuilder.group({
      selected: this.formBuilder.array([])
    });
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submitRequest() {
    this.options = [];
    this.checkedElement = [];

    this.orchestrator.orchestration(this.selectedService)
      .subscribe(response => {
          //this.notifier.notify('success', "Your request has been successfully submitted. ");
          this.requestResponse = response;
          for (let r of this.requestResponse.response) {
            this.options.push(r);
          }
        },
        (error) => {
          // this.notifier.notify('error', " " + error);
        })
  }


  save() {
    this.savedElement = [...this.checkedElement];
    if (this.savedElement.length > 0) {
      for (let s of this.savedElement) {
        let optionBody = this.options.filter(
          (o) =>
            o.metadata.FE_Sensor_ID == s.FE_Sensor_ID && o.metadata.FE_Site_ID == s.FE_Site_ID
        );
        this.postUpdate(optionBody[0]);
      }
    } else {
      this.notifier.notify('warning', 'Warning: no element selected');
    }
  }

  postUpdate(toConfig) {
    this.orchestrator.saveConfig(toConfig)
      .subscribe(response => {
          this.response = response.body;
          if (this.response.inserted_object_id) {
            /* this.showPanel = true;
              this.panelOpenState = !this.panelOpenState;
              this.charChild.getCities();*/

            let sensor = toConfig.metadata.FE_Sensor_ID;
            let city = toConfig.metadata.FE_Site_ID;
            let data = {city: city, sensor: sensor};
            /*  this.charChild.changeConfig(city, sensor);
              this.getCities();*/
            this.dialogRef.close(data);

            this.notifier.notify('success', 'Success: ' + this.response.message);
          } else {
            this.notifier.notify('error', 'Data not saved: ' + this.response.message);
          }
        },
        err => {
          console.log(err);
          this.notifier.notify('error', 'Data not saved ');
        }
      )
  }

  onChange(event) {
    const selected = <FormArray>this.responseFormGroup.get('selected') as FormArray;
    if (event.checked) {
      selected.push(new FormControl(event.source.value));
      this.checkedElement.push((event.source.value));
    } else {
      const i = selected.controls.findIndex(x => x.value === event.source.value);
      selected.removeAt(i);
      this.checkedElement.splice(i, 1);
    }

  }


  close() {
    this.dialogRef.close();
  }
}







