import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {OrchestratorApiService} from "../orchestrator_api/orchestrator-api.service";
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {NotifierService} from "angular-notifier";
import {ChartVisualizationComponent} from "../chart-visualization/chart-visualization.component";

export interface DialogData {
  dateFrom: string;
  dateTo: string;
  date: FormControl;
  cities: string[];
  sensors: string[];
}

@Component({
  selector: 'app-request-form',
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.scss']
})
export class RequestFormComponent implements OnInit, AfterViewInit {

  /*char variables*/
  @ViewChild(ChartVisualizationComponent) charChild;


  /*Request form*/
  selectedPType = 'mqtt';
  selectedLocation = 'to';
  selectedSID = '857';
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
  private readonly notifier: NotifierService;

  constructor(private orchestrator: OrchestratorApiService, private formBuilder: FormBuilder, public dialog: MatDialog,
              notifierService: NotifierService) {
    this.notifier = notifierService;

    this.orchestrator.getInitialConfig().subscribe(response => {
        this.initialConfig = response;
        this.initConfig();
      },
      (error) => {
        console.log(error);
      });
  }

  ngOnInit() {
    this.parentMessage = "";
    this.responseFormGroup = this.formBuilder.group({
      selected: this.formBuilder.array([])
    });

    this.getCities();
    this.getSensors();
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

  onChange(event) {
    const selected = <FormArray>this.responseFormGroup.get('selected') as FormArray;
    if (event.checked) {
      selected.push(new FormControl(event.source.value));
      this.checkedElement.push((event.source.value).toString());
    } else {
      const i = selected.controls.findIndex(x => x.value === event.source.value);
      selected.removeAt(i);
      this.checkedElement.splice(i, 1);
    }
  }

  submitRequest() {
    //this.options = [];
    // this.checkedElement = [];

    this.orchestrator.submitRequest(this.selectedSID)
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
        })
  }


  save() {
    this.savedElement = [...this.checkedElement];

    if (this.savedElement.length > 0) {

      for (let s of this.savedElement) {
        let optionBody = this.options.filter(
          (o) => o.metadata.FE_Sensor_ID === s
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
            let city  = toConfig.metadata.FE_Site_ID;
            this.charChild.changeConfig(city,sensor);
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
}





