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

let currentLabel: string[] = [];
export default currentLabel

@Component({
  selector: 'app-chart-visualization',
  templateUrl: './chart-visualization.component.html',
  styleUrls: ['./chart-visualization.component.scss']
})


export class ChartVisualizationComponent implements OnInit {
  @ViewChild(BaseChartDirective) lineChart: BaseChartDirective;
  @Output() messageEventLA = new EventEmitter<any>();
  @Output() messageEventLO = new EventEmitter<string>();

  messageLatitude = 0;
  messageLongitude = 0;
  offset = 0;
  today: any;

  response: any;
  responseChart: any;
  initialConfig: any;
  cities: string[] = [];
  sensors: string[] = [];
  errorList: any[] = [];
  unixtimeF: any = 0;
  unixtimeT: any = 0;

  sensorUnit = "";
  sensorName: "";
  city: "";
  timeRange = "";

  avgV: any = 0;
  minV: any = 0;
  maxV: any = 0;


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
      backgroundColor: 'red',
      borderColor: 'red',
      type: "scatter",
      pointStyle: "crossRot",
      pointRadius: 9,
    },
    {
      data: [],
      backgroundColor: 'transparent',
      borderColor: '#24D46D',
      pointBackgroundColor: '#11DB42',
      type: 'line',
    },
    {
      data: [],
      backgroundColor: 'transparent',
      borderColor: '#0119F5',
      pointBackgroundColor: '#5dade2',
      type: 'line',
    },
    {
      data: [],
      backgroundColor: 'transparent',
      borderColor: '#FA6D12',
      pointBackgroundColor: '#FF802B',
      type: 'line',
    },
    {
      data: [],
      backgroundColor: 'transparent',
      borderColor: '#DB30B4',
      pointBackgroundColor: 'FF52D7',
      type: 'line',
    },
    {
      data: [],
      backgroundColor: 'transparent',
      borderColor: '#D9C8BD',
      pointBackgroundColor: '#8C796C',
      type: 'line',
    },
  ];
  lineChartLabels: Label[] = [];
  lineChartOptions = {
    responsive: true,

    legend: {
      labels: {
        filter: function (legendItem, chartData) {
          console.log(JSON.stringify(legendItem));
          if (legendItem.text == undefined || legendItem.text === '') return false;
          else return true;
        }
      }
    },
    tooltips: {
      callbacks: {
        label: function (tooltipItem, data) {
          var l = data.datasets[tooltipItem.datasetIndex].label || '';
          var label = currentLabel[tooltipItem.index];
          let s = [];
          if (l) {
            s = label.split('-');
          }
          return l;
        },
        footer: function (tooltipItems, data) {
          var value = 0;
          let s = [];
          tooltipItems.forEach(function (tooltipItem) {
            //  var label = data.datasets[tooltipItem.datasetIndex].label || '';
            var label = currentLabel[tooltipItem.index];
            s = label.split('-');
            value += data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
          });
          if (s[1]) {
            return 'Sensor measurement: ' + value + " " + s[1] + " " + s[3];
          } else {
            return '';
          }
        }
      }
    },
    scales: {
      yAxes: [{
        display: true,
        ticks: {
          autoSkip: false,
        },
      }],
      xAxes: [{
        scaleLabel: {labelString: '', display: false},
        type: 'time',
        ticks: {
          gridLines: {
            display: true
          },
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
  lineChartType = 'line';

  constructor(private orchestrator: OrchestratorApiService, public dialog: MatDialog) {
    this.getCities();
    this.getSensors();
    this.init()
      .then(() => {
        this.initConfig();
      })
      .then(() => {
        this.getDataInit(this.filter.city, this.filter.sName);
      })
  }


  async ngOnInit(): Promise<void> {
    this.offset = await this.getOffset(this.initialConfig.result[0].FE_Latitude, this.initialConfig.result[0].FE_Longitude);
    this.orchestrator.getErrorList().subscribe(response => {
        this.errorList = response.result;
      },
      (error) => {
        console.log(error);
      });
  }

  async init() {
    this.initialConfig = await this.orchestrator.getInitialConfig()
  }


  async initConfig() {
    if (this.initialConfig.result && this.initialConfig.result.length > 0) {
      this.filter.city = this.initialConfig.result[0].FE_Site_ID;
      this.filter.sName = this.initialConfig.result[0].FE_Sensor_ID;
      this.messageLatitude = this.initialConfig.result[0].FE_Latitude;
      this.messageLongitude = this.initialConfig.result[0].FE_Longitude;

      this.filter.dF = new Date();
      this.filter.dT = new Date();
      this.filter.hF = "00:00";
      this.filter.hT = "23:59";
      this.offset = await this.getOffset(this.initialConfig.result[0].FE_Latitude, this.initialConfig.result[0].FE_Longitude);
    }
  }


  visualizeList(list) {
    this.getDataList(list)
      .then(() => {
          this.draw(list.length);
        }
      )
  }

  async getDataList(list) {
    if (this.filter.city) {
      this.filter.city = [];
    }
    this.filter.city = [];
    this.filter.dF = new Date();
    this.filter.dT = new Date();
    this.filter.hF = "00:00";
    this.filter.hT = "23:59";


    let stringList = '';
    for (let s of list) {
      stringList = stringList + s.Site_ID + '+' + s.Sensor_ID + '&';
      this.filter.sName = s.Sensor_ID;
      this.filter.city.push(s.Site_ID);
      await this.getCoordinates(s.Sensor_ID, s.Site_ID);
    }
    //this.offset = await this.getOffset(this.initialConfig.result[0].FE_Latitude, this.initialConfig.result[0].FE_Longitude);
    let timeRange = await this.getTimeRange(this.offset);
    let newStr = stringList.substring(0, stringList.length - 1);
    this.responseChart = await this.orchestrator.getMultiQuery(newStr, timeRange);
  }

  async getDataInit(site, sensor) {
    this.offset = await this.getOffset(this.initialConfig.result[0].FE_Latitude, this.initialConfig.result[0].FE_Longitude);
    let timeRange = await this.getTimeRange(this.offset);
    let stringList = '';
    stringList = stringList + site + '+' + sensor;
    this.maxV = await this.orchestrator.maxData(sensor, site, this.getTimeRange7Days(this.offset));
    this.minV = await this.orchestrator.minData(sensor, site, this.getTimeRange7Days(this.offset));
    this.avgV = await this.orchestrator.avgData(sensor, site, this.getTimeRange7Days(this.offset));
    this.responseChart = await this.orchestrator.getMultiQuery(stringList, timeRange);
    this.draw(1);
  }

  async draw(tot) {

    let i = 1;
    this.lineChart.chart.data.datasets.forEach((dataset) => {
      dataset.data = [];
    });

    this.lineChart.chart.data.datasets[1].label = '';
    this.lineChart.chart.data.datasets[2].label = '';
    this.lineChart.chart.data.datasets[3].label = '';
    this.lineChart.chart.data.datasets[4].label = '';
    this.lineChart.chart.data.datasets[5].label = '';

    currentLabel = [];
    this.lineChartLabels = [];  /*Refresh label*/
    let total = tot;

    /*timerange from - to*/

    let dateChartFrom = new Date((this.unixtimeF + this.offset) * 1000);
    let dateChartTo = (new Date((this.unixtimeT + this.offset) * 1000));

    if ((this.unixtimeT - this.unixtimeF) >= 86340) {
    dateChartTo.setDate(dateChartTo.getDate() - 1);
    }

    var hoursFrom = (new Date((this.unixtimeF + this.offset) * 1000)).getUTCHours();
    var minutesFrom = "0" + (new Date((this.unixtimeF + this.offset) * 1000)).getUTCMinutes();
    var secondsFrom = "0" + (new Date((this.unixtimeF + this.offset) * 1000)).getUTCSeconds();
    var formattedTimeFROM = dateChartFrom.toDateString() + '  ' + hoursFrom + ':' + minutesFrom.substr(-2) + ':' + secondsFrom.substr(-2);

    var hoursTo = (new Date((this.unixtimeT + this.offset) * 1000)).getUTCHours();
    var minutesTo = "0" + (new Date((this.unixtimeT + this.offset) * 1000)).getUTCMinutes();
    var secondsTo = "0" + (new Date((this.unixtimeT + this.offset) * 1000)).getUTCSeconds();
    var formattedTimeTo = (dateChartTo).toDateString() + '  ' + hoursTo + ':' + minutesTo.substr(-2) + ':' + secondsTo.substr(-2);

    this.responseChart.result = this.responseChart.result.sort((a, b) => {
        return b.values.length - a.values.length;
      }
    );
    for (let k of this.responseChart.result) {
      let cont = 0;

      let maxV: any = await this.orchestrator.maxData(k.Sensor_ID, k.Site_ID, this.getTimeRange7Days(this.offset));
      let minV: any = await this.orchestrator.minData(k.Sensor_ID, k.Site_ID, this.getTimeRange7Days(this.offset));
      let avgV: any = await this.orchestrator.avgData(k.Sensor_ID, k.Site_ID, this.getTimeRange7Days(this.offset));

      for (let e of k.values) {
        if (cont == 0) {
          this.addDataBis(null, formattedTimeFROM, e.Sensor_Name, e.Sensor_ID, e.Site_ID, e.Meas_Unit, i, total, maxV, minV, avgV);
        }
        let unix_timestamp = e.Meas_Timestamp;

        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

        //var date = (new Date((unix_timestamp) * 1000));
        //var date = (new Date((unix_timestamp + this.offset) * 1000))
        var year = (new Date((unix_timestamp + this.offset) * 1000)).getUTCFullYear();
        var month = months[(new Date((unix_timestamp + this.offset) * 1000)).getUTCMonth()];
        var weekday = days[(new Date((unix_timestamp + this.offset) * 1000)).getUTCDay()];
        var date = (new Date((unix_timestamp + this.offset) * 1000)).getUTCDate();
        var hours = (new Date((unix_timestamp + this.offset) * 1000)).getUTCHours();
        var minutes = "0" + (new Date((unix_timestamp + this.offset) * 1000)).getUTCMinutes();
        var seconds = "0" + (new Date((unix_timestamp + this.offset) * 1000)).getUTCSeconds();

        var formattedTime = weekday + ' ' + month + ' ' + date + ' ' + year + '  ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
        //var formattedTime = date.toDateString() + '  ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

        this.addDataBis(e.Meas_Value, formattedTime, e.Sensor_Name, e.Sensor_ID, e.Site_ID, e.Meas_Unit, i, total, maxV, minV, avgV);

        if (cont == k.values.length - 1) {
          this.addDataBis(null, formattedTimeTo, e.Sensor_Name, e.Sensor_ID, e.Site_ID, e.Meas_Unit, i, total, maxV, minV, avgV);
        }

        cont = cont + 1;
      }
      i = i + 1;
    }


  }


  refresh() {
    this.sendRequestUpdate();
  }

  async getCities() {
    this.response = await this.orchestrator.getCities();
    this.cities = [...this.response.result];
  }

  async getSensors() {
    this.response = await this.orchestrator.getSensors();
    this.sensors = [...this.response.result];
  }

  async getCoordinates(sID, city) {
    this.response = await this.orchestrator.getCoordinates(sID, city);
    this.messageLatitude = this.response.result[0].Latitude;
    this.messageLongitude = this.response.result[0].Longitude;
    this.offset = await this.getOffset(this.messageLatitude, this.messageLongitude);
    this.sendMessage();
  }

  sendMessage() {
    let c = {
      lat: this.messageLatitude,
      lng: this.messageLongitude
    };
    this.messageEventLA.emit(c);
    // this.messageEventLO.emit(this.messageLongitude);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogFil, {
      width: '500px',
      data: {
        date: this.date.value,
        cities: this.cities,
        sensors: this.sensors
      },
    });

    dialogRef.afterClosed()
      .subscribe(result => {
        this.filter = result;
        if (this.filter && this.filter.btn === "upd") {
          console.log('Updating');
          this.sendRequestUpdate().then(() => {
            this.messageEventLO.emit('set');
          });
        } else {
          console.log('The dialog was closed');
        }
      });
  }


  async getOffset(lat, lng) {
    let resp: any = await this.orchestrator.getTimeZone(lat, lng);
    //this.offset = await resp.gmtOffset;
    return resp.gmtOffset;
  }


  async sendRequestUpdate() {
    let city = "";
    if (this.filter.city) {
      city = this.filter.city;
    }

    let sensor = this.filter.sName;
    this.messageEventLO.emit('cancel');
    for (let s of city) {
      await this.getCoordinates(sensor, s);
    }
    //this.offset = await this.getOffset(this.initialConfig.result[0].FE_Latitude, this.initialConfig.result[0].FE_Longitude);
    let timeRange = await this.getTimeRange(this.offset);
    this.update(sensor, city, timeRange)
      .then(() => {
        this.draw(city.length);
        }
      )
  }


  async update(sensor, city, timeRange) {
    let stringList = '';
    for (let s of city) {
      stringList = stringList + s + '+' + sensor + '&'
    }
    let newStr = stringList.substring(0, stringList.length - 1);
    this.responseChart = await this.orchestrator.getMultiQuery(newStr, timeRange);
  }


  addDataBis(data, label, sName, sID, site, mUnit, position, total, max, min, avg) {
    let e = this.errorList.filter((e) => e.error_value == data);
    if (e && e.length > 0) {
      this.lineChart.chart.data.datasets[0].data.push(0);
      this.lineChart.chart.data.datasets[0].label = 'Error';
      let l = 'Error:' + e[0].error_code + ' ' + e[0].error_description;
      currentLabel.push(l);
      for (let i = 1; i <= total; i++) {
        this.lineChart.chart.data.datasets[i].data.push(null);
      }
    } else {
      this.lineChart.chart.data.datasets[position].data.push(data);
      this.lineChart.chart.data.datasets[position].label = 'Sensor name: ' + sName + ' ' + site;
      let l = 'Sensor name: ' + sName + '-' + mUnit + '-' + site + '-' +
        ' avg: ' + avg.result[0] + ' min: ' + min.result[0] + ' max: ' + max.result[0];

      currentLabel.push(l);
      for (let i = 0; i <= total; i++) {
        if (i != position) {
          this.lineChart.chart.data.datasets[i].data.push(null);
        }
      }
    }
    this.lineChartLabels.push(label);
  }


  async getTimeRange(offset) {
    console.log("Offset: " + offset)
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


  getTimeRange7Days(offset) {
    /*Data From - Data to*/
    return this.getLast7days(this.unixtimeF) + '_' + this.unixtimeF;
  }

  getLast7days(timestamp) {
    let day = 60 * 60 * 24;
    return timestamp - 7 * day;
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
  cities: string[] = [];
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

  changeSensor(event) {
    this.getCitiesForSensor(this.selectedSensor);
  }

  async getCity() {
    this.response = await this.orchestrator.getCities();
    this.data.cities = [...this.response.result];
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

  getCitiesForSensor(sensor) {
    this.orchestrator.getCitiesSensor(sensor).subscribe(
      response => {
        this.response = response;
        this.cities = [...this.response.result];
      },
      error => {
        console.log('ERROR GET SENSORS CITY')
      }
    )
  }


  async getSensors() {
    this.response = this.orchestrator.getSensors();
    this.sensors = [...this.response.result];
  }

  checkDate() {/*48h*/
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

    let start = this.getUnixTimeStamp(yearDF, monthDF, dayDF, hoursF, minutesF, secondF);
    let stop = this.getUnixTimeStamp(yearDT, monthDT, dayDT, hoursT, minutesT, secondT);

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



