import {Component, EventEmitter, Inject, OnInit, Output, ViewChild} from '@angular/core';
import {ChartDataSets} from 'chart.js';
import {BaseChartDirective, Color, Label} from 'ng2-charts';
import {OrchestratorApiService} from "../orchestrator_api/orchestrator-api.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FormControl, Validators} from "@angular/forms";
import {NotifierService} from "angular-notifier";
import 'chartjs-plugin-annotation'


export interface DialogData {
  date: FormControl;
  cities: string[];
  sensors: string[];
}

@Component({
  selector: 'app-chart-visualization',
  templateUrl: './chart-visualization.component.html',
  styleUrls: ['./chart-visualization.component.scss']
})


export class ChartVisualizationComponent implements OnInit {
  @ViewChild(BaseChartDirective) lineChart: BaseChartDirective;
  @Output() messageEventLA = new EventEmitter<number>();
  @Output() messageEventLO = new EventEmitter<number>();

  messageLatitude = 0;
  messageLongitude = 0;
  offset = 0;

  response: any;
  responseChart: any;
  initialConfig: any;
  cities: string[] = [];
  sensors: string[] = [];
  unixtimeF: any = 0;
  unixtimeT: any = 0;

  sensorUnit = "";
  sensorName: "";
  city: "";
  timeRange = "";
  filterDataDF: any = new Date();
  filterDataDT: any = new Date();

  filter: { sName, city, dF, dT, hF, hT, btn } = {
    sName: "",
    city: "",
    dF: new Date(),
    dT: new Date(),
    hF: "00:00",
    hT: "23:59",
    btn: ""
  };

  date: any = new FormControl(new Date());
  public readonly notifier: NotifierService;
  lineChartData: ChartDataSets[] = [
    {
      data: [],
      label: 'Sensor data',
      backgroundColor: '#1FBF74',
      borderColor: '#097341',
    },
    {
      data: [],
      label: 'Error',
      backgroundColor: 'red',
      borderColor: 'red',
      type: "scatter",
      pointStyle: "crossRot",
      pointRadius: 5
    },
  ];
  lineChartLabels: Label[] = [];
  lineChartOptions = {
    responsive: true,
    legend: {
      display: true,
    },
    scales: {
      yAxes: [{
        display: true,
        ticks: {
          beginAtZero: true,
          stepSize: 5,
          autoSkip: false
        },
      }],
      xAxes: [{
        scaleLabel: {labelString: '', display: true},
        type: 'time',
        ticks: {
          gridLines: {
            display: true
          }
        },
        time: {
          autoSkip: false,
          unitStepSize: 10,
          displayFormats: {
            'millisecond': 'MMM DD ',
            'second': 'MMM DD - HH mm ss ',
            'minute': 'MMM DD - HH mm',
            'hour': 'MMM DD - HH',
            'day': 'MMM DD - HH',
            'week': 'MMM DD - HH',
            'month': 'MMM DD - HH',
            'quarter': 'MMM DD - HH',
            'year': 'MMM DD - HH',
          }
        },
      }]
    }
  };
  lineChartColors: Color[] = [];
  lineChartLegend = true;
  lineChartPlugins = {};
  lineChartType = 'bar';

  constructor(private orchestrator: OrchestratorApiService, public dialog: MatDialog) {
    this.getCities();
    this.getSensors();

    this.orchestrator.getInitialConfig().subscribe(response => {
        this.initialConfig = response;
        this.initConfig();
      },
      (error) => {
        console.log(error);
      });
  }

  ngOnInit(): void {
  }

  initConfig() {
    if (this.initialConfig.result && this.initialConfig.result.length > 0) {
      this.filter.city = this.initialConfig.result[0].FE_Site_ID;
      this.filter.sName = this.initialConfig.result[0].FE_Sensor_ID;
      this.messageLatitude = this.initialConfig.result[0].FE_Latitude;
      this.messageLongitude = this.initialConfig.result[0].FE_Latitude;
      this.filter.dF = new Date();
      this.filter.dT = new Date();
      this.filter.hF = "00:00";
      this.filter.hT = "23:59";

      this.getOffset(this.initialConfig.result[0].FE_Latitude, this.initialConfig.result[0].FE_Logitude);
      let timeRange = this.getTimeRange(this.offset);
      this.update(this.filter.sName, this.filter.city, timeRange);
    }
  }

  changeConfig(city, sensor) {
    this.filter.dF = new Date();
    this.filter.dT = new Date();
    this.filter.hF = "00:00";
    this.filter.hT = "23:59";

    this.filter.city = city;
    this.filter.sName = sensor;
    this.sendRequestUpdateSave();
  }

  sendRequestUpdateSave() {
    let city = this.filter.city;
    let sensor = this.filter.sName;
    this.getCoordinates(sensor, city);
    let timeRange = this.getTimeRange(this.offset);
    this.update(sensor, city, timeRange);
  }

  refresh() {
    this.sendRequestUpdate();
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

  getCoordinates(sID, city) {
    this.orchestrator.getCoordinates(sID, city).subscribe(
      response => {
        this.response = response;
        this.messageLatitude = response.result[0].Latitude;
        this.messageLongitude = response.result[0].Longitude;
        this.getOffset(this.messageLatitude, this.messageLongitude);
        this.sendMessage();
      },
      error => {
        console.log('ERROR GET COORDINATES')
      }
    )
  }

  sendMessage() {
    this.messageEventLA.emit(this.messageLatitude);
    this.messageEventLO.emit(this.messageLongitude);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogFil, {
      width: '500px',
      data: {
        date: this.date.value,
        cities: this.cities,
        sensors: ''
      },
    });

    dialogRef.afterClosed()
      .subscribe(result => {
        this.filter = result;
        if (this.filter && this.filter.btn === "upd") {
          console.log('Updating');
          this.sendRequestUpdate();
        } else {
          console.log('The dialog was closed');
        }
      });
  }


  getOffset(lat, lng) {
    let o: any = 0;
    this.orchestrator.getTimeZone(lat, lng)
      .subscribe(response => {
          console.log(response);
          o = response;
          this.offset = o.gmtOffset;

          let city = this.filter.city;
          let sensor = this.filter.sName;
          let timeRange = this.getTimeRange(this.offset);
          this.update(sensor, city, timeRange);
        }
      );
  }


  sendRequestUpdate() {
    let city = this.filter.city;
    let sensor = this.filter.sName;
    this.getCoordinates(sensor, city);
    let timeRange = this.getTimeRange(this.offset);
    this.update(sensor, city, timeRange);
  }


  update(sensor, city, timeRange) {
    this.orchestrator.getData(sensor, city, timeRange)
      .subscribe(response => {
          this.responseChart = response.result;
          this.drawChart();
        },
        err => {
          console.log('ERROR GET DATA!');
        }
      )
  }

  drawChart() {
    this.lineChart.chart.data.datasets.forEach((dataset) => {
      dataset.data = [];
    });   /*Refresh data*/

    this.lineChartLabels = [];  /*Refresh label*/

    /*timerange from - to*/
    let dateChartFrom = new Date(this.unixtimeF * 1000);
    this.addData(0, dateChartFrom, 'No value', 'Id', 'site', '');


    let dateChartTo = new Date(this.unixtimeT * 1000);
    this.addData(0, dateChartTo, '', '', '', '');

    for (let e of this.responseChart) {

      let unix_timestamp = e.Meas_Timestamp;
      var date = new Date(unix_timestamp * 1000);
      var hours = date.getHours();
      var minutes = "0" + date.getMinutes();
      var seconds = "0" + date.getSeconds();


      // Will display time in 10:30:23 format
      var formattedTime = date.toDateString() + '  ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

      this.sensorUnit = e.Meas_Unit;
      this.sensorName = e.Sensor_Name;
      this.city = e.Site_ID;
      this.addData(e.Meas_Value, formattedTime, e.Sensor_Name, e.Sensor_ID, e.Site_ID, e.Meas_Unit);
    }
  }

  addData(data, label, sName, sID, site, mUnit) {

    /*this.lineChart.chart.data.datasets.forEach((dataset) => {
     dataset.data.push(data);
   });*/

    this.lineChart.chart.data.datasets[0].data.push(data);
    this.lineChart.chart.data.datasets[1].data.push(0);

    /*this.lineChart.chart.data.datasets.forEach((dataset) => {
      dataset.label = 'Sensor name: ' + sName + " \n\n" + '   ' + mUnit;
    });*/

    this.lineChart.chart.data.datasets[0].label = 'Sensor name: ' + sName + " \n\n" + '   ' + mUnit;
    this.lineChartLabels.push(label);
  }


  getTimeRange(offset) {
    /*Data From - Data to*/
    this.filterDataDF = new Date(this.filter.dF);
    this.filterDataDT = new Date(this.filter.dT);

    let yearDF = this.filterDataDF.getFullYear();
    let monthDF = this.filterDataDF.getMonth() + 1;
    let dayDF = this.filterDataDF.getDate();

    let yearDT = this.filterDataDT.getFullYear();
    let monthDT = this.filterDataDT.getMonth() + 1;
    let dayDT = this.filterDataDT.getDate();

    let hoursF = parseInt(this.filter.hF.split(":")[0]);
    let minutesF = parseInt(this.filter.hF.split(":")[1]);
    let secondF = 0;

    let hoursT = parseInt(this.filter.hT.split(":")[0]);
    let minutesT = parseInt(this.filter.hT.split(":")[1]);
    let secondT = 0;

    let start = this.getUnixTimeStamp(yearDF, monthDF, dayDF, hoursF, minutesF, secondF);
    this.unixtimeF = start - offset;
    let stop = this.getUnixTimeStamp(yearDT, monthDT, dayDT, hoursT, minutesT, secondT);
    this.unixtimeT = stop - offset;

    return this.unixtimeF + '_' + this.unixtimeT;
  }


  public getUnixTimeStamp(year, month, day, hour, minute, second) {
    let datum = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    return datum.getTime() / 1000;
  }
}


/*Dialog filter*/
@Component({
  selector: 'dialog-fil',
  templateUrl: 'dialogFil.html',
  styleUrls: ['./chart-visualization.component.scss']
})
export class DialogFil {
  sensors: string[] = [];
  response: any;

  /*Form values*/
  start_time: string;
  end_time: string;
  selectedCity: string;
  selectedSensor: string;
  selectedDateFrom: any;
  selectedDateTo: any;


  cityError = new FormControl('', [Validators.required]);
  sensorError = new FormControl('', [Validators.required]);


  filter: { sName, city, dF, dT, hF, hT, btn } = {sName: "", city: "", dF: "", dT: "", hF: "", hT: "", btn: ""};

  public readonly notifier: NotifierService;

  constructor(private orchestrator: OrchestratorApiService, public dialogRef: MatDialogRef<DialogFil>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData, notifierService: NotifierService) {

    this.notifier = notifierService;
    this.selectedDateFrom = data.date;
    this.selectedDateTo = data.date;
    this.start_time = "00:00";
    this.end_time = "23:59";
  }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  update() {
    if (this.selectedCity && this.selectedSensor && this.checkDate() <= 48) {
      this.filter.city = this.selectedCity;
      this.filter.sName = this.selectedSensor;
      this.filter.dF = this.selectedDateFrom;
      this.filter.dT = this.selectedDateTo;
      this.filter.hF = this.start_time;
      this.filter.hT = this.end_time;
      this.filter.btn = "upd";
      this.dialogRef.close(this.filter);
    } else {
      this.notifier.notify('error', "Select a city,  sensor and max 48H to update");
    }
  }

  changeCity(event) {
    this.getSensorForCity(this.selectedCity);
  }

  getCity() {
    this.orchestrator.getCities().subscribe(
      response => {
        this.response = response;
        this.data.cities = [...this.response.result];
      },
      error => {
        console.log('ERROR GET SENSORS CITY')
      }
    )
  }

  getSensorForCity(city) {
    this.orchestrator.getSensorsCity(city).subscribe(
      response => {
        this.response = response;
        this.sensors = [...this.response.result];
      },
      error => {
        console.log('ERROR GET SENSORS CITY')
      }
    )
  }

  checkDate() {
    let filterDataDF = new Date(this.selectedDateFrom);
    let filterDataDT = new Date(this.selectedDateTo);

    let yearDF = filterDataDF.getFullYear();
    let monthDF = filterDataDF.getMonth() + 1;
    let dayDF = filterDataDF.getDate();

    let yearDT = filterDataDT.getFullYear();
    let monthDT = filterDataDT.getMonth() + 1;
    let dayDT = filterDataDT.getDate();

    let hoursF = parseInt(this.start_time.split(":")[0]);
    let minutesF = parseInt(this.start_time.split(":")[1]);
    let secondF = 0;

    let hoursT = parseInt(this.end_time.split(":")[0]);
    let minutesT = parseInt(this.end_time.split(":")[1]);
    let secondT = 0;

    let start = this.getUnixTimeStamp(yearDF, monthDF, dayDF, hoursF, minutesF, secondF) - 7200;
    let stop = this.getUnixTimeStamp(yearDT, monthDT, dayDT, hoursT, minutesT, secondT) - 7200;

    let startDate = new Date(start * 1000);
    let stopDate = new Date(stop * 1000);

    var diff = Math.abs(stopDate.getTime() - startDate.getTime()) / 3600000;
    return diff;
  }

  public getUnixTimeStamp(year, month, day, hour, minute, second) {
    let datum = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    return datum.getTime() / 1000;
  }
}



