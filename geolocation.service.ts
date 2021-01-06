import { Observable } from 'rxjs/Observable';
import { Environment } from '../../environment';
import { Http, RequestOptions, Headers } from '@angular/http';
import { UserSessionApi } from '../../models/user-session-api';
import { Injectable } from '@angular/core';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation';
import { Location } from '../../models/location';
import { UserAccountLocation } from '../../models/user-account-location';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderReverseResult } from '@ionic-native/native-geocoder';


import 'rxjs/add/operator/map';
import 'rxjs/add/observable/fromPromise';

@Injectable()
export class GeolocationService {

  private URL_RESOURCE: string = Environment.resourcesBaseUrl +  'user-account-location/';

  constructor(
    private http: Http, 
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder) {
  }

  sendUserAccountLocation(userSessionApi: UserSessionApi): void {
    let options: GeolocationOptions = {
      timeout: 30000,
      enableHighAccuracy: true,
      maximumAge: 60000
    };

    let geocodeOptions: NativeGeocoderOptions = {
      useLocale: true,
      defaultLocale: 'pt_BR',
      maxResults: 1
    };

    this.geolocation.getCurrentPosition(options).then((geolocation) => {
      let location: Location = new Location();
      location.latitude = geolocation.coords.latitude;
      location.longitude = geolocation.coords.longitude;

      let userAccountLocation: UserAccountLocation = new UserAccountLocation();
      userAccountLocation.userAccountId = userSessionApi.userAccount.id;
      userAccountLocation.location = location;

      this.nativeGeocoder.reverseGeocode(geolocation.coords.latitude, geolocation.coords.longitude, geocodeOptions)
        .then((result: NativeGeocoderReverseResult[]) => {
          userAccountLocation.location.countryCode = result[0].countryCode;
          userAccountLocation.location.countryName = result[0].countryName;
          userAccountLocation.location.postalCode = result[0].postalCode;
          userAccountLocation.location.administrativeArea = result[0].administrativeArea;
          userAccountLocation.location.subAdministrativeArea = result[0].subAdministrativeArea;
          userAccountLocation.location.locality = result[0].locality;
          userAccountLocation.location.subLocality = result[0].subLocality;
          userAccountLocation.location.thoroughfare = result[0].thoroughfare;
          userAccountLocation.location.subThoroughfare = result[0].subThoroughfare;
          this.postUserAccountLocation(userSessionApi, userAccountLocation);
        }).catch(error => {
          this.postUserAccountLocation(userSessionApi, userAccountLocation);
        });
    }).catch(error => {});
  }

  private postUserAccountLocation(userSessionApi: UserSessionApi, userAccountLocation: UserAccountLocation): void {
    let options = new RequestOptions();
      options.headers = new Headers({ 'authorization':  userSessionApi != null ? userSessionApi.token : '' });

    this.http.post(`${this.URL_RESOURCE}create`, userAccountLocation, options)
      .subscribe(res => {
        //nothing to do
      }, error => {});
  }

  getCurrentGeolocation(): Observable<Location> {
    let options: GeolocationOptions = {
      timeout: 30000,
      enableHighAccuracy: true,
      maximumAge: 60000
    };

    let geocodeOptions: NativeGeocoderOptions = {
      useLocale: true,
      defaultLocale: 'pt_BR',
      maxResults: 1
    };

    return Observable.fromPromise(this.geolocation.getCurrentPosition(options)).flatMap((geolocation) => {
      let location: Location = new Location();
      location.latitude = geolocation.coords.latitude;
      location.longitude = geolocation.coords.longitude;

      return Observable.fromPromise(this.nativeGeocoder.reverseGeocode(location.latitude, location.longitude, geocodeOptions))
        .map((result: NativeGeocoderReverseResult[]) => {
          location.countryCode = result[0].countryCode;
          location.countryName = result[0].countryName;
          location.postalCode = result[0].postalCode;
          location.administrativeArea = result[0].administrativeArea;
          location.subAdministrativeArea = result[0].subAdministrativeArea;
          location.locality = result[0].locality;
          location.subLocality = result[0].subLocality;
          location.thoroughfare = result[0].thoroughfare;
          location.subThoroughfare = result[0].subThoroughfare;

          return location;
        });
    })
  }
}