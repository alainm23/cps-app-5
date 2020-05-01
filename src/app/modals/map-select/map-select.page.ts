import { Component, ViewChild, ElementRef, Input, OnInit } from '@angular/core';
import { Platform, NavController, LoadingController, ModalController } from '@ionic/angular';

import { StorageService } from '../../providers/storage.service';
import { TranslateService } from '@ngx-translate/core';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';

declare var google: any;

@Component({
  selector: 'app-map-select',
  templateUrl: './map-select.page.html',
  styleUrls: ['./map-select.page.scss'],
})
export class MapSelectPage implements OnInit {
  @ViewChild ('map', { static: false }) mapRef: ElementRef;
  @ViewChild ('searchbar', { read: ElementRef, static: false }) searchbar: ElementRef;

  i18n: any;
  map: any;
  loading: any;

  @Input () latitude: number = 0;
  @Input () longitude: number = 0;
  @Input () search_text: string = "";

  directionsService: any = new google.maps.DirectionsService ();
  constructor(public navCtrl: NavController, 
              private storage: StorageService,
              private translateService: TranslateService,
              public loadingCtrl: LoadingController,
              private geolocation: Geolocation, 
              private locationAccuracy: LocationAccuracy,
              private androidPermissions: AndroidPermissions,
              private platform: Platform,
              public viewCtrl: ModalController) {
  }

  ngOnInit () {
    this.storage.getValue ('i18n').then (i18n => {
      this.translateService.getTranslation (i18n).subscribe (async (i18n: any) => {
        this.i18n = i18n;
        
        this.loading = await this.loadingCtrl.create ({
          message: this.i18n.procesando_informacion
        });
        
        await this.loading.present ().then (() => {
          if (((this.latitude === 0) || (this.latitude === undefined)) && ((this.longitude === 0) || (this.longitude == undefined))) {
            if (this.platform.is ('cordova')) {
              this.checkGPSPermission ();
            } else {
              this.getLocationCoordinates ();
            }
          } else {
            this.InitMap (true, this.latitude, this.longitude);
          }

          this.initAutocomplete ();
        });
      });
    });
  }

  async InitMap (has_location: boolean, latitude: number, longitude: number) {
    let location = new google.maps.LatLng (latitude, longitude);

    const options = {  
      center: location,
      zoom: 15,
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

    this.map = await new google.maps.Map (this.mapRef.nativeElement, options);

    if (this.map === null || this.map === undefined) {
      console.log ('Error del puto GPS');
      this.loading.dismiss ();  
    } else {
      this.loading.dismiss ();
    } 

    google.maps.event.addListener(this.map, 'idle', () => {
      let location = this.map.getCenter ();
      
      this.latitude = location.lat ();
      this.longitude = location.lng ();

      let request = {
        origin: location,
        destination: location,
        travelMode: google.maps.TravelMode.WALKING
      };

      this.directionsService.route(request, (result, status) => {
        if (status == google.maps.DirectionsStatus.OK) {
          let d = result.routes [0].legs [0].start_address;
          let d_list = d.split (" ");;
              
          let _direccion = "";
          for (let letter of d_list) {
            if (letter != "Cusco," && letter != "Perú" && letter != "Cusco" && letter != "08000" && letter != "08000,") {
            _direccion = _direccion + letter + " ";
            }
          }

          if (_direccion.charAt (_direccion.length - 2) == ",") {
            this.search_text = _direccion.substring (0, _direccion.length - 2);
          }
        }
      });
    });
  }

  async getCurrentLocation () {
    this.loading = await this.loadingCtrl.create ({
      message: this.i18n.buscando_ubicacion
    });
    
    await this.loading.present ().then (() => {
      this.geolocation.getCurrentPosition ().then (position => {
        this.loading.dismiss().then(() => {
          let lat = position.coords.latitude;
          let lng = position.coords.longitude;

          let location = new google.maps.LatLng (lat, lng);
          this.map.setZoom (17);
          this.map.panTo (location);
        });
      });
    });
  }

  initAutocomplete () {
    const options = {
      types: ['establishment'],
      componentRestrictions: {country: "pe"}
    };
    
    let searchInput = this.searchbar.nativeElement.querySelector('input');
    let autocomplete = new google.maps.places.Autocomplete (searchInput);

    google.maps.event.addListener (autocomplete, 'place_changed', async () => {
      this.loading = await this.loadingCtrl.create({
        message: this.i18n.buscando_ubicacion
      });

      await this.loading.present();
      
      await this.loading.dismiss ().then(() => {
        let place = autocomplete.getPlace ()
        this.search_text = place.formatted_address;

        let location = new google.maps.LatLng (place.geometry.location.lat(), place.geometry.location.lng());
        
        this.map.setZoom (17);
        this.map.panTo (location);
      });
    });
  }

  goLocation (lat: number, lng: number) {
    let location = new google.maps.LatLng (lat, lng);
    this.map.setZoom (17);
    this.map.panTo (location);
  }

  closeModal() {
    this.viewCtrl.dismiss ();
  }

  select () {
    this.viewCtrl.dismiss ({
      latitude: this.latitude,
      longitude: this.longitude,
      address: this.search_text
    }, 'ok');
  }

  async checkGPSPermission () {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
      .then ((result: any) => {
        if (result.hasPermission) {
          //alert ("Tiene permiso, preguntamos para prender el GPS");
          //If having permission show 'Turn On GPS' dialogue
          this.askToTurnOnGPS ();
        } else {
  
          //If not having permission ask for permission
          //alert ("No tiene permiso, preguntamos para ternerlo");
          this.requestGPSPermission ();
        }
      },
      err => {
        alert (err);
      }
    );
  }

  askToTurnOnGPS () {
    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
      .then(() => {
        this.getLocationCoordinates ();
      }, error => {
        this.loading.dismiss ();
        this.navCtrl.pop ();
        console.log ('Error requesting location permissions ' + JSON.stringify(error))
      });
  }

  async requestGPSPermission () {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        
      } else {
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
          .then(() => {
            this.askToTurnOnGPS ();
          }, error => {
            this.loading.dismiss ();
            this.navCtrl.pop ();
            console.log ('requestPermission Error requesting location permissions ' + error)
          }
        );
      }
    });
  }

  async getLocationCoordinates () {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.InitMap (false, resp.coords.latitude, resp.coords.longitude);
    }).catch((error) => {
      this.loading.dismiss ();
      console.log ('Error getting location' + error);
    });
  }
}
