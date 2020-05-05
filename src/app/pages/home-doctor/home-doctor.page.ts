import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

import { Platform, ModalController, NavController, LoadingController, ActionSheetController, AlertController } from '@ionic/angular';

// import { ImageViewerController } from "ionic-img-viewer";

// Param
import { ActivatedRoute } from '@angular/router';
declare var google: any;

import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { AuthService } from '../../providers/auth.service';
import { DatabaseService } from '../../providers/database.service';
import { StorageService } from '../../providers/storage.service';
import { ApiService } from '../../providers/api.service';
import { TranslateService } from '@ngx-translate/core';
 
// Geolocation
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';

import { PaisesCodsPage } from '../../modals/paises-cods/paises-cods.page';

@Component({
  selector: 'app-home-doctor',
  templateUrl: './home-doctor.page.html',
  styleUrls: ['./home-doctor.page.scss'],
})
export class HomeDoctorPage implements OnInit {
  @ViewChild('map', { static: true } ) mapRef: ElementRef;
  map: any;
  loading: any;
 
  latitude: number = 0;
  longitude: number = 0;

  form: FormGroup;
  directionsService: any = new google.maps.DirectionsService ();

  is_edit: boolean = false;

  pais_selected: any = {
    name: "Peru",
    dial_code: "+51",
    code: "PE"
  };

  min_date: string = new Date ().toISOString ();
  i18n: any;
  constructor(public navCtrl: NavController,
              private route: ActivatedRoute,
              private camera: Camera,
              public auth: AuthService,
              private storage: StorageService,
              private database: DatabaseService,
              private alertCtrl: AlertController,
              private actionSheetCtrl: ActionSheetController,
              // public imageViewerCtrl: ImageViewerController,
              private geolocation: Geolocation,
              private locationAccuracy: LocationAccuracy,
              private androidPermissions: AndroidPermissions,
              private translateService: TranslateService,
              private api: ApiService,
              public loadingCtrl: LoadingController,
              public modalController: ModalController,
              private platform: Platform) {
  }

  ngOnInit () {
    let phone_number;

    if (this.auth.is_logged) {
      if (this.auth.user.country_name !== '') {
        this.pais_selected.name = this.auth.user.country_name;
      }
  
      if (this.auth.user.country_dial_code !== '') {
        this.pais_selected.dial_code = this.auth.user.country_dial_code;
      }

      if (this.auth.user.country_code !== '') {
        this.pais_selected.code = this.auth.user.country_code;
      }

      if (this.auth.user.phone_number !== '') {
        phone_number = this.auth.user.phone_number;
      }
    } else {
      phone_number = "";
    }

    this.form = new FormGroup({
      address: new FormControl ("", [Validators.required]),
      hour: new FormControl ("", [Validators.required]),
      note: new FormControl (""),
      date: new FormControl (new Date ().toISOString (), [Validators.required]),
      phone_number: new FormControl (phone_number, [Validators.required]),
      lang: new FormControl ('es', Validators.required),
    });

    console.log ('id', this.route.snapshot.paramMap.get ('id'));
    console.log ('edit', this.route.snapshot.paramMap.get ('edit'));

    this.storage.getValue ('i18n').then (async i18n => {
      this.translateService.getTranslation (i18n).subscribe (async (i18n: any) => {
        this.i18n = i18n;
        
        this.loading = await this.loadingCtrl.create ({
          message: this.i18n.procesando_informacion
        });
        
        await this.loading.present ().then (() => {
          if (this.route.snapshot.paramMap.get ('edit') === 'true') {
            this.is_edit = true;
            
            this.database.getHomeDoctorByKey (this.route.snapshot.paramMap.get ('id')).subscribe ((data: any) => {
              this.form.controls ["address"].setValue (data.address);
              this.form.controls ["hour"].setValue (data.hour);
              this.form.controls ["note"].setValue (data.note);
              this.form.controls ["date"].setValue (data.date);

              this.form.controls ["lang"].setValue (data.lang);

              this.latitude = data.latitude;
              this.longitude = data.longitude;

              this.InitMap (true, data.latitude, data.longitude);
            });
          } else {
            if (this.platform.is ('cordova')) {
              this.checkGPSPermission ();
            } else {
              this.getLocationCoordinates ();
            }
          }
        });
      });
    }); 
  }

  async InitMap (is_edit: boolean, latitude: number, longitude: number) {
    let location = new google.maps.LatLng (latitude, longitude);

    const options = {
      draggable: !is_edit,  
      scrollwheel: !is_edit, 
      disableDoubleClickZoom: is_edit,
      center: location,
      zoom: 15,
      disableDefaultUI: true,
      streetViewControl: false,
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
          
      let placesService = new google.maps.places.PlacesService (this.map);

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
            this.form.controls ["address"].setValue (_direccion.substring (0, _direccion.length - 2));
          }
        }
      });
    });

    if (is_edit) {
      try {
        let elem = document.getElementById ('map-card');
        elem.setAttribute("style", "opacity: 0.5;");
      }catch (error) {
        console.log (error);
      }
    } else {
        try {
          let elem = document.getElementById ('map-card');
          elem.setAttribute("style", "opacity: 1;");
        }catch (error) {
          console.log (error);
        }
    }
  }
  
  goHome () {
    this.navCtrl.navigateRoot ("home");  
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

  get_hours () {
    let list = [
      '00:00',
      '01:00',
      '02:00',
      '03:00',
      '04:00',
      '05:00',
      '06:00',
      '07:00',
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
      '20:00',
      '21:00',
      '22:00',
      '23:00'
    ]

    return list;
  }

  check_hour (date: string) {
    const value = this.form.value;

    const date_selected = new Date (value.date);
    const now = new Date ();
    
    if (date_selected > now) {
      return true;
    } else {
      let time = date.substring (0, 2); 

      if ((now.getHours () + 2) > +time) {
        return false;
      } else {
        return true;
      }
    }
  }

  async submit () {
    const loading = await this.loadingCtrl.create({
      message: this.i18n.procesando_informacion
    });

    await loading.present ();
     
    const value = this.form.value;

    this.storage.getValue ("uid").then (uid => {
      this.storage.getValue ("token_id").then (token_id => {
        let data: any = {
          id: uid,
          token_id: token_id,
          address: value.address,

          lang: value.lang,
          
          hour: value.hour,
          note: value.note,
          latitude: this.latitude,
          longitude: this.longitude,
          date: value.date,
          price: 0,
          delivery_price: 0,
          delivery_time: 0,
          is_checked: false,  
          is_paid: false,
          is_sent: false,
          state: 'created',
          last_message: '',
          transaccion_id: '',
          payment_type: '', //online, cash,
          why_canceled: '',
          who_canceled: '',
          who_canceled_name: '',
          created_date: new Date ().toISOString (), 
          canceled_date: '',
          arrived_date: '',
          approved_date: '',
          completed_date: '',
          admi_id: '',
          admi_name: '',
          user_phone_number: value.phone_number,
          user_fullname: this.auth.user.first_name + " " + this.auth.user.last_name,
          user_email: this.auth.user.email,
          country_name: this.pais_selected.name,
          country_dial_code: this.pais_selected.dial_code,
          country_code: this.pais_selected.code,
          solicitante: 'usuario'
        };

        if (this.route.snapshot.paramMap.get ('edit') === 'true') {
          data.id = this.route.snapshot.paramMap.get ('id');

          this.database.updateHomeDoctor (this.route.snapshot.paramMap.get ('id'), data).then ((response) => {
            let push_data = {
              titulo: 'Pedido de doctor a domicilio',
              detalle: 'Un pedido de doctor a domicilio fue corregido',
              destino: 'doctor',
              mode: 'tags',
              clave: uid,
              tokens: 'Administrador'
            };

            this.api.pushNotification (push_data).subscribe (response => {
              console.log ("Notificacion Enviada...", response);
              this.loading.dismiss ();
              this.goHome ();
            }, error => {
              console.log ("Notificacion Error...", error);
              this.loading.dismiss ();
              this.goHome ();
            });
          });
        } else {
          this.database.addHomeDoctor (uid, data, this.pais_selected).then ((response) => {
            let push_data = {
              titulo: 'Pedido de doctor a domicilio',
              detalle: 'Un pedido de doctor a domicilio fue solicitado',
              destino: 'doctor',
              mode: 'tags',
              clave: uid,
              tokens: 'Administrador'
            };

            this.api.pushNotification (push_data).subscribe (response => {
              console.log ("Notificacion Enviada...", response);
              this.loading.dismiss ();
              this.goHome ();
            }, error => {
              console.log ("Notificacion Error...", error);
              this.loading.dismiss ();
              this.goHome ();
            });
          });
        }
      });
    });
  }

  getFlat () {
    return "https://www.countryflags.io/" + this.pais_selected.code + "/flat/24.png";
  }

  async select_code () {
    const modal = await this.modalController.create({
      component: PaisesCodsPage,
    });

    modal.onDidDismiss ().then ((response: any) => {
      if (response.role === 'ok') {
        this.pais_selected = response.data;
        this.getFlat ();
      }
    });

    return await modal.present ();
  }

  async enableMapa () {
    const confirm = await this.alertCtrl.create({
      header: this.i18n.desea_habilitar_mapa,
      buttons: [
        {
          text: this.i18n.No,
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: this.i18n.Si,
          handler: () => {
            var newOptions = {
              draggable: true,
              scrollwheel: true,
              disableDoubleClickZoom: false,
            };

            this.map.setOptions (newOptions);

            try {
              let elem = document.getElementById ('map-card');
              elem.setAttribute("style", "opacity: 1;");
            }catch (error) {
              console.log (error);
            }
          }
        }
      ]
    });

    await confirm.present();
  }

  goEmergency () {
    this.navCtrl.navigateForward ("emergency");
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
