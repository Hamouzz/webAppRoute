import { HttpService } from '@nestjs/axios';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { take } from 'rxjs';
import { AppService } from './app.service';
const voitures = [{ id: 0, nom: 'Renault', autonomie: 200 }, { id: 1, nom: 'Tesla', autonomie: 250 }, { id: 2, nom: 'BMW', autonomie: 300 }, { id: 3, nom: 'AUDI', autonomie: 400 },]
@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private httpService: HttpService) { }

  @Get('voitures')
  getHello() {
    return voitures;
  }

  @Post('itineraire')
  async getItineraire(@Body() object: any) {
    let res: Promise<[]> = new Promise<[]>(resolve => {
      this.httpService.get('https://api.openrouteservice.org/v2/directions/driving-car/', {
        params: {
          "api_key": "5b3ce3597851110001cf6248f52b4b8af4fc45199dc5c6c5cf6e8447",
          "start": object.dep.geometry.coordinates.toString(),
          "end": object.arr.geometry.coordinates.toString(),
        }
      }).pipe(
        take(1)
      ).subscribe(
        (data: any) => {
          let coords = data.data.features[0].geometry.coordinates;
          let distance = 0.0;
          let lastelem: any = null;
          let arrets: any = []
          coords.forEach((element: any) => {
            if (lastelem)
              distance += this.getDistanceFromLatLonInKm(lastelem[0], lastelem[1], element[0], element[1])
            if (distance >= (0.8 * object.voi.autonomie)) {
              arrets.push(element)
              distance = 0.0
            }
            lastelem = element;
          });
          resolve(arrets);
        }
      )
    })
    let mesArrets: Array<any> = await res;
    mesArrets = [object.dep.geometry.coordinates, ...mesArrets]
    mesArrets = [...mesArrets, object.arr.geometry.coordinates]
    let maReponse = { arrets: mesArrets, polylines: new Array<[]>() }
    let myLastArret: any = null;
    for (let index = 0; index < mesArrets.length; index++) {
      const element = mesArrets[index];
      if (myLastArret) {
        let oneOf = new Promise<[]>(resolve => {
          this.httpService.get('https://api.openrouteservice.org/v2/directions/driving-car/', {
            params: {
              "api_key": "5b3ce3597851110001cf6248f52b4b8af4fc45199dc5c6c5cf6e8447",
              "start": myLastArret.toString(),
              "end": element.toString(),
            }
          }).pipe(
            take(1)
          ).subscribe(
            (data: any) => {
              let coords = data.data.features[0].geometry.coordinates;
              resolve(coords);
            }
          )
        })
        let toAdd = await oneOf
        maReponse.polylines.push(toAdd)
      }
      myLastArret = element;
    }
    return maReponse;
  }

  @Get('search')
  async getAdresse(@Query('q') q: string) {
    let res = new Promise(resolve => {
      this.httpService.get('https://api-adresse.data.gouv.fr/search/', {
        params: {
          "q": q,
          "type": "municipality",
        }
      }).pipe(
        take(1)
      ).subscribe(data => {
        resolve(data)
      })
    })
    let response:any = await res
    return response.data;
  }
  getDistanceFromLatLonInKm(lat1: any, lon1: any, lat2: any, lon2: any) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  deg2rad(deg: any) {
    return deg * (Math.PI / 180)
  }
}
