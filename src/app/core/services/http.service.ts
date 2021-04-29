import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  constructor(private http: HttpClient) {}

  // tslint:disable-next-line:typedef
  fetchLocations(searchTerm) {
    return this.http.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/
				${searchTerm.split(' ').join('+')}.json?
				access_token=${environment.ACCESS_TOKEN}`
    );
  }

  // tslint:disable-next-line:typedef
  fetchLinestringArea(currLocation) {
    console.log(
      this.http.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/
				${currLocation.bbox[0]},${currLocation.bbox[1]};
				${currLocation.bbox[2]},${currLocation.bbox[3]}?
				geometries=geojson&
				access_token=${environment.ACCESS_TOKEN}`
      )
    );

    return this.http.get(
      `https://api.mapbox.com/directions/v5/mapbox/driving/
				${currLocation.bbox[0]},${currLocation.bbox[1]};
				${currLocation.bbox[2]},${currLocation.bbox[3]}?
				geometries=geojson&
				access_token=${environment.ACCESS_TOKEN}`
    );
  }

  // tslint:disable-next-line:typedef
  fetchPolygoneArea(currLocation) {
    return this.http.get(
      `https://api.mapbox.com/isochrone/v1/mapbox/cycling/
				${currLocation.center[0]},${currLocation.center[1]}?
				contours_minutes=20&polygons=true&
				access_token=${environment.ACCESS_TOKEN}`
    );
  }
  // tslint:disable-next-line:typedef
  fetchPinsArea() {
    return this.http.get(
      `https://raw.githubusercontent.com/mrios01/angular-ivy-lixydj/master/bycicleparking.geojson`
    );
  }


}
