import { SchedulingService } from '../../providers/scheduling/scheduling.service';
import { Scheduling } from '../../models/scheduling';
import { GeolocationService } from '../../providers/geolocation/geolocation.service';
import { Component } from '@angular/core';
import { ToastController, AlertController, NavParams,ViewController } from 'ionic-angular';
import { GoogleMaps, GoogleMap, Marker, GoogleMapsEvent, GoogleMapOptions } from '@ionic-native/google-maps';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { Location } from '../../models/location';
import { Checkin } from '../../models/checkin';



@Component({
  selector: 'page-checkin-modal',
  templateUrl: 'checkin-modal.html',
})
export class CheckinModalPage {
  map: GoogleMap;
  scheduling: Scheduling = new Scheduling();
  locations:Location;
  optionPage;

  constructor(
  public viewCtrl: ViewController,
  public toastCtrl:ToastController,
  public loadingCtrl: LoadingController, 
  public geolocation: GeolocationService, 
  public schedulingService: SchedulingService,
  public alertCtrl: AlertController,
  public navParams: NavParams,) {
  }

    ionViewDidLoad() {
      //aqui inicia a page e chama o metodo que busca as posições do mapa
      this.loadMap();
      this.optionPage = this.navParams.get('optionPage');
      this.scheduling = this.navParams.get('scheduling');
    }

    currentPage(){
      if(this.optionPage == "Check-in"){
        this.onCheckin();
      } else{
        this.onCheckout();
      }

    }
  
    loadMap() {
      //cria e chama o mapa e sua posições
      this.geolocation.getCurrentGeolocation().subscribe((location: Location) => {
       this.locations = location;

       let mapOptions: GoogleMapOptions = {
        camera: {
           target: {
             lat: location.latitude,
             lng: location.longitude
           },
           zoom: 18,
           tilt: 30
         }
      };

       //mostra a posição no mapa na qual o usuario está
       this.map = GoogleMaps.create('map_canvas', mapOptions);

       var marker:Marker = this.map.addMarkerSync({
        title: 'Você está aqui!',
      icon: '#fd4c10',
      animation: 'DROP',
      position: {
        lat: location.latitude,
        lng: location.longitude
      }
      });
    
      marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
      });

       })  
    }

    onCheckin(){
      //faz de fato o checkin
      let confirm = this.alertCtrl.create({
        title: 'Check-in',
        message: 'Confirma o Check-in para a demanda?',
        buttons: [
          {
            text: 'Não'
          },
          {
            text: 'Sim',
            handler: () => {
              this.schedulingService.checkin(this.scheduling,this.locations).subscribe((checkin:Checkin) => {
                this.scheduling.userAccountcheckin = checkin.userAccountcheckin;
                this.scheduling.checkin = checkin.checkin;
                this.schedulingService.saveToStorage(this.scheduling);
                this.viewCtrl.dismiss(null);
              }, error => {
                this.showErrorConnection(error.text());
              });
            }
          }
  
        ]
      });
      confirm.present();
    }

    onCheckout(): void {
      let confirm = this.alertCtrl.create({
        title: 'Check-out',
        message: 'Confirma o Check-out para a demanda?',
        buttons: [
          {
            text: 'Não'
          },
          {
            text: 'Sim',
            handler: () => {
              this.schedulingService.checkout(this.scheduling, this.locations).subscribe((checkin:Checkin) => {
                this.scheduling.checkout = checkin.checkout;
                this.scheduling.duration = checkin.duration;
                this.schedulingService.saveToStorage(this.scheduling);
                this.viewCtrl.dismiss(null);
              }, error => {
                this.showErrorConnection(error);
              });
            }
          }
        ]
      });
      confirm.present();
      this.viewCtrl.dismiss(null);
    }
  

    private showErrorConnection(message?: string): void {
      if (!message) {
        message = 'Não foi possível obter os dados no momento. Tente novamente mais tarde.';
      }
      this.toastCtrl.create({
        message: message,
        position: 'bottom',
        duration: 5000,
        showCloseButton: true,
        closeButtonText: 'Ok'
      }).present();
    }
}



