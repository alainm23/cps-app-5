import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { LoadingController, NavController, AlertController } from '@ionic/angular';

import { DatabaseService } from '../../providers/database.service';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { ApiService } from '../../providers/api.service';

declare var google: any;

// Translate Service
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../../providers/storage.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-confirm-ambulance',
  templateUrl: './confirm-ambulance.page.html',
  styleUrls: ['./confirm-ambulance.page.scss'],
})
export class ConfirmAmbulancePage implements OnInit {
  @ViewChild('map2', { static: false }) mapRef: ElementRef;
  loading: any;

  map: any;
  marker: any;
  marker_ambulance: any;
  ambulance_object: any;  

  ambulance_marker: any;

  directionsDisplay: any;
  directionsService: any;
  i18n: any
  constructor(public navCtrl: NavController, 
              private callNumber: CallNumber,
              private database: DatabaseService,
              public alertCtrl: AlertController,
              private route: ActivatedRoute,
              private translateService: TranslateService,
              private storage: StorageService, 
              private api: ApiService,
              public loadingCtrl: LoadingController) {
  }

  ngOnInit () {
    this.storage.getValue ('i18n').then (i18n => {
      this.translateService.getTranslation (i18n).subscribe (async (i18n: any) => {
        this.i18n = i18n;

        this.loading = await this.loadingCtrl.create ({
          message: this.i18n.procesando_informacion
        });
        
        this.loading.present ().then (() => {
          this.database.getSendAmbulance (this.route.snapshot.paramMap.get ("id")).subscribe ((data: any) => {
            if (data) {
              this.ambulance_object = data;

              this.InitMap (data.latitude, data.longitude);

              if (data.state === 'sent') {
                this.addRute (data.latitude, data.longitude, data.ambulance_ori_lat, data.ambulance_ori_lon);
              }
            }        
          });

          this.database.getSendAmbulancesLocation (this.route.snapshot.paramMap.get ("id")).subscribe ((data: any) => {
            if (data) {
              try {
                this.updateMark (data.ambulance_lat, data.ambulance_lon);
              } catch (error) {
                console.log (error);
              }
            }
          });
        });
      });
    });
  }

  ngOnDestroy () {

  }

  InitMap (latitude: number, longitude:number) {
    this.loading.dismiss ();
    let location = new google.maps.LatLng (latitude, longitude);
    
    const options = {
      center: location,
      zoom: 17,
      disableDefaultUI: true,
      streetViewControl: false,
      disableDoubleClickZoom: false,
      clickableIcons: false,
      scaleControl: true,
      styles: [
        {
          "featureType": "poi",
          "elementType": "labels.text",
          "stylers": [{
            "visibility": "off"
          }]
        },
        {
          "featureType": "poi.business",
          "stylers": [{
            "visibility": "off"
          }]
        },
        {
          "featureType": "road",
          "elementType": "labels.icon",
          "stylers": [{
            "visibility": "off"
          }]
        },
        {
          "featureType": "transit",
          "stylers": [{
            "visibility": "off"
          }]
        }
      ],
      mapTypeId: 'roadmap',
    }

    this.map = new google.maps.Map (this.mapRef.nativeElement, options);

    this.marker = new google.maps.Marker({
      position: location,
      map: this.map,
      title: 'Direccion',
      animation: google.maps.Animation.DROP
    });

    this.directionsDisplay = new google.maps.DirectionsRenderer ();
    this.directionsService = new google.maps.DirectionsService ();
  }

  goHome () {
    this.navCtrl.navigateRoot ('home'); 
  }
  
  async cancel () {
    const confirm = await this.alertCtrl.create({
      header: this.i18n.cancelar_pedido, 
      message: this.i18n.estas_seguro_cancelar,
      inputs: [
        {
          name: 'message',
          placeholder: this.i18n.motivo_cancelacion
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            
          }
        },
        {
          text: this.i18n.OK,
          handler: async (data) => {
            let loading = await this.loadingCtrl.create ({
              message: this.i18n.procesando_informacion
            });
            
            await loading.present ();

            this.database.cancelSendAmbulance (this.ambulance_object, data.message)
              .then (() => {
                let push_data = {
                  titulo: 'Solicitud de ambulancia cancelada',
                  detalle: 'El usuario cancelo su solicitud',
                  destino: '',
                  mode: 'tags',
                  clave: '',
                  tokens: 'Administrador'
                };
      
                this.api.pushNotification (push_data).subscribe (response => {
                  console.log ("Notificacion Enviada...", response);
                  loading.dismiss ();
                  this.goHome ();
                }, error => {
                  console.log ("Notificacion Error...", error);
                  loading.dismiss ();
                  this.goHome ();
                });
              })
              .catch (() => {
                loading.dismiss ();
                this.goHome ();
              });
          }
        }
      ]
    });

    confirm.present();
  }

  callNow () {
    this.callNumber.callNumber("+51989316622", true)
    .then(res => console.log('Launched dialer!', res))
    .catch(err => console.log('Error launching dialer', err));
  }

  addRute (latitude: number, longitude: number, ambulance_lat: number, ambulance_lon: number) {
    let point_ambulance = new google.maps.LatLng (ambulance_lat, ambulance_lon);
    let point_destino = new google.maps.LatLng (latitude, longitude);

    this.directionsDisplay.setMap (this.map);

    let request = {
      origin: point_ambulance,
      destination: point_destino,
      travelMode: google.maps.TravelMode ['DRIVING']
    }

    this.directionsService.route (request, (response, status) => {
      if (status == 'OK') {
        this.directionsDisplay.setDirections (response);
      }
    });

    this.marker_ambulance = new google.maps.Marker({
      position: point_ambulance,
      map: this.map,
      icon: 'assets/ambulance.svg'
    });

    this.marker_ambulance.setMap (this.map);
  }

  updateMark (ambulance_lat: number, ambulance_lon: number) {
    let location = new google.maps.LatLng (ambulance_lat, ambulance_lon);
    this.marker_ambulance.setPosition (location);
  }
}
