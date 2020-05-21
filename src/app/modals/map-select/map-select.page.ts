import { Component, ViewChild, ElementRef, Input, OnInit } from '@angular/core';
import { Platform, NavController, LoadingController, ModalController } from '@ionic/angular';

import { StorageService } from '../../providers/storage.service';
import { TranslateService } from '@ngx-translate/core';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationEvents, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation/ngx';

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
  _search_text: string = '';

  directionsService: any = new google.maps.DirectionsService ();
  constructor(public navCtrl: NavController, 
              private storage: StorageService,
              private translateService: TranslateService,
              public loadingCtrl: LoadingController,
              private geolocation: Geolocation, 
              private locationAccuracy: LocationAccuracy,
              private androidPermissions: AndroidPermissions,
              private platform: Platform,
              private backgroundGeolocation: BackgroundGeolocation,
              public viewCtrl: ModalController) {
  }

  ngOnInit () {
    this.storage.getValue ('i18n').then (i18n => {
      this.translateService.getTranslation (i18n).subscribe (async (i18n: any) => {
        this.i18n = i18n;
        
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
    } else {
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
          console.log ();
          this._search_text = result.routes [0].legs [0].start_address.replace (', Peru', '').replace (', Cusco', '');
        }
      });
    });
  }

  async getCurrentLocation () {
    let loading = await this.loadingCtrl.create ({
      message: this.i18n.buscando_ubicacion
    });
    
    await loading.present ().then (() => {
      this.geolocation.getCurrentPosition ().then (position => {
        loading.dismiss().then(() => {
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
      let loading = await this.loadingCtrl.create({
        message: this.i18n.buscando_ubicacion
      });

      await loading.present();
      
      await loading.dismiss ().then(() => {
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

  closeModal () {
    this.viewCtrl.dismiss ();
  }

  select () {
    this.viewCtrl.dismiss ({
      latitude: this.latitude,
      longitude: this.longitude,
      address: this._search_text
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
            this.navCtrl.pop ();
            console.log ('requestPermission Error requesting location permissions ' + error)
          }
        );
      }
    });
  }

  ionViewDidLeave () {
    this.backgroundGeolocation.finish (); // FOR IOS ONLY
    this.backgroundGeolocation.stop ();
      
    console.log ('Se cancelo el gps');
  }

  async getLocationCoordinates () {
    let loading = await this.loadingCtrl.create ({
      message: this.i18n.procesando_informacion
    });
    
    await loading.present ();

    if (this.platform.is ('android')) {
      const config: BackgroundGeolocationConfig = {
        desiredAccuracy: 10,
        stationaryRadius: 20,
        distanceFilter: 30,
        notificationsEnabled: false,
        debug: false, //  enable this hear sounds for background-geolocation life-cycle.
        stopOnTerminate: false, // enable this to clear background location settings when the app terminates
      };
  
      this.backgroundGeolocation.configure (config)
        .then(() => {
          this.backgroundGeolocation.on (BackgroundGeolocationEvents.location).subscribe ((location: BackgroundGeolocationResponse) => {
            console.log(location);
  
            loading.dismiss ();
            this.InitMap (false, location.latitude, location.longitude);
  
            this.backgroundGeolocation.finish (); // FOR IOS ONLY
          });
        });
  
      this.backgroundGeolocation.start ();
      this.backgroundGeolocation.stop ();
    } else if (this.platform.is ('ios')) {
      this.geolocation.getCurrentPosition ().then((resp) => {
        loading.dismiss ();
        this.InitMap (false, resp.coords.latitude, resp.coords.longitude);
      }).catch ((error) => {
        loading.dismiss ();
        console.log ('Error getting location' + error);
      });
    }

    // this.geolocation.getCurrentPosition ().then((resp) => {
    //   loading.dismiss ();
    //   this.InitMap (false, resp.coords.latitude, resp.coords.longitude);
    // }).catch ((error) => {
    //   loading.dismiss ();
    //   console.log ('Error getting location' + error);
    // });
  }
}
