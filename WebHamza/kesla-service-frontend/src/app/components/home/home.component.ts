import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { icon, latLng, marker, polyline, tileLayer } from 'leaflet';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.voiture$ = this.http.get(environment.server_url + "voitures")
  }

  dep$: Observable<any> = new Observable();
  arr$: Observable<any> = new Observable();
  voiture$: Observable<any> = new Observable();
  direction$: Observable<any> = new Observable();

  depObj: any;
  arrObj: any;
  voiObj: any;

  mapForm = new FormGroup({
    depart: new FormControl(''),
    arrivee: new FormControl(''),
    voiture: new FormControl(''),
  })
  layers: any = [];

  onSubmit() {
    this.http.post(environment.server_url + "itineraire", {
      dep: this.depObj,
      arr: this.arrObj,
      voi: this.mapForm.value['voiture'],
    }).subscribe((data: any) => {
      this.layers = []
      data.arrets.forEach((element: any) => {
        let toAdd: any = [element[1], element[0]]
        this.layers = [...this.layers, marker(toAdd, {
          icon: icon({
            iconUrl: "../../assets/marker-icon.png",
            shadowUrl: "../../assets/assets/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12.5, 41]
          })
        })]
      });
      data.polylines.forEach((element: any) => {
        let toAdd: any = [];
        element.forEach((point: any) => {
          toAdd = [...toAdd, [point[1], point[0]]]
        });
        this.layers = [...this.layers, polyline(toAdd)]
      });
    })

  }

  voiChange(event:any,voi: any) {
    console.log(event,voi)
    this.voiObj = voi;
  }

  depChange() {
    let options = {
      params: new HttpParams({
        fromObject: {
          'q': this.mapForm.value['depart'],
          'type': 'municipality'
        }
      })
    }
    if (this.mapForm.value['depart']) {
      this.dep$ = this.http.get(environment.server_url +'search', options)
    }
    else {
      this.dep$ = new Observable()
    }
    console.log(this.mapForm.value['depart'])
  }

  depSelect(event: any, dep: any) {
    console.log(dep)
    this.depObj = dep;
    this.mapForm.controls['depart'].setValue(dep.properties.label)
    this.dep$ = new Observable()
  }

  arrSelect(event: any, arr: any) {
    this.mapForm.controls['arrivee'].setValue(arr.properties.label)
    this.arr$ = new Observable()
    this.arrObj = arr;
    console.log(arr)
  }

  arrChange() {
    let options = {
      params: new HttpParams({
        fromObject: {
          'q': this.mapForm.value['arrivee'],
          'type': 'municipality'
        }
      })
    }
    if (this.mapForm.value['arrivee']) {
      this.arr$ = this.http.get(environment.server_url +'search', options)
    }
    else {
      this.arr$ = new Observable()
    }
    console.log(this.mapForm.value['arrivee'])
  }

  options = {
    layers: [
      tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: 'OpenStreetMap' }),
    ],
    zoom: 5,
    center: latLng(46.7, 3.1)
  };

}
