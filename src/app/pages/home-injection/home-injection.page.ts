import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Platform, AlertController, NavController, LoadingController, ActionSheetController, ModalController } from '@ionic/angular';
 
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

import { FormControl, FormGroup, Validators } from "@angular/forms";
// import { ImageViewerController } from "ionic-img-viewer";

import { DatabaseService } from '../../providers/database.service';
import { StorageService } from '../../providers/storage.service';
import { AuthService } from '../../providers/auth.service';
import { ApiService } from '../../providers/api.service';
import { TranslateService } from '@ngx-translate/core'; 

// Geolocation
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';

declare var google: any;
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { PaisesCodsPage } from '../../modals/paises-cods/paises-cods.page';

@Component({
  selector: 'app-home-injection',
  templateUrl: './home-injection.page.html',
  styleUrls: ['./home-injection.page.scss'],
})
export class HomeInjectionPage implements OnInit {
  @ViewChild('map', { static: false }) mapRef: ElementRef;
  map: any;
  loading: any;

  latitude: number = 0;
  longitude: number = 0;

  horario: string = "1";

  imagenes: any;

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
              private translateService: TranslateService,
              private geolocation: Geolocation,
              private camera: Camera,
              public modalController: ModalController,
              private database: DatabaseService,
              private storage: StorageService,
              private auth: AuthService,
              private api: ApiService,
              private alertCtrl: AlertController,
              private locationAccuracy: LocationAccuracy,
              private androidPermissions: AndroidPermissions,
              // public imageViewerCtrl: ImageViewerController,
              private actionSheetCtrl: ActionSheetController,
              private platform: Platform,
              public loadingCtrl: LoadingController) {
  }

  ngOnInit () {
    this.imagenes = new Array();
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
      need_supplies: new FormControl (true, [Validators.required]),
      need_medicine: new FormControl (true, [Validators.required]),
      has_all: new FormControl (false, [Validators.required]), 
      hour: new FormControl ("", [Validators.required]),
      note: new FormControl (""),
      has_orden: new FormControl (false),
      date: new FormControl (new Date ().toISOString (), [Validators.required]),
      phone_number: new FormControl (phone_number, [Validators.required]),
      tipo_comprobante: new FormControl (null, [Validators.required]),
      ruc: new FormControl (""),
      razon_social: new FormControl (""),
      terms_conditions: new FormControl (false, Validators.compose([ Validators.required, Validators.pattern('true')]))
    });

    this.storage.getValue ('i18n').then (i18n => {
      this.translateService.getTranslation (i18n).subscribe ((i18n: any) => {
        this.i18n = i18n;
        
        this.loading = this.loadingCtrl.create ({
          message: this.i18n.procesando_informacion
        });
        
        this.loading.present ().then (() => {
          if (this.route.snapshot.paramMap.get ('edit')) {  
            this.is_edit = true;
            
            this.database.getHomeInjectionByKey (this.route.snapshot.paramMap.get ('id')).subscribe ((data: any) => {
              if (data) {
                this.form.controls ["address"].setValue (data.address);
                this.form.controls ["need_supplies"].setValue (data.need_supplies);
                this.form.controls ["need_medicine"].setValue (data.need_medicine);
                this.form.controls ["hour"].setValue (data.hour);
                this.form.controls ["note"].setValue (data.note);
                this.form.controls ["date"].setValue (data.date);
                this.form.controls ["tipo_comprobante"].setValue (data.tipo_comprobante);
                this.form.controls ["ruc"].setValue (data.ruc);
                this.form.controls ["razon_social"].setValue (data.razon_social);

                this.comprobanteChange (data.tipo_comprobante);
                
                if (data.imagenes !== '') {
                  this.imagenes = data.imagenes;
                }

                this.latitude = data.latitude;
                this.longitude = data.longitude;

                this.InitMap (true, data.latitude, data.longitude);
              }
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
      } catch (error) {
        console.log (error);
      }
    } else {
      try {
        let elem = document.getElementById ('map-card');
        elem.setAttribute("style", "opacity: 1;");
      } catch (error) {
        console.log (error);
      }
    }
  }
  
  goHome () {
    this.navCtrl.navigateRoot ('home');  
  }
  
  async presentActionSheet () { 
    let actionSheet = await this.actionSheetCtrl.create ({
      buttons: [
        {
          text: this.i18n.tomar_foto,
          handler: () => {
            this.getPicture ();
          }
        },
        {
          text: this.i18n.escoger_galeria,
          handler: () => {
            this.accessGallery();
          }
        },
        {
          text: this.i18n.CANCEL,
          role: 'cancel'
        }
      ]
    });
    
    await actionSheet.present();
  }

  accessGallery () {
    let options: CameraOptions = {
      sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM, 
      destinationType: this.camera.DestinationType.DATA_URL,
      targetWidth: 625,
      targetHeight: 875,
      quality: 75
    }

    this.camera.getPicture (options).then (imageData => {
        this.imagenes.push (`data:image/jpeg;base64,${imageData}`);
      })
      .catch ( error => {
        console.log(error);
      })
  }

  getPicture () {
    let options: CameraOptions = {
      destinationType: this.camera.DestinationType.DATA_URL,
      targetWidth: 625,
      targetHeight: 875,
      quality: 75
    }
    this.camera.getPicture(options).then(imageData => {
      this.imagenes.push (`data:image/jpeg;base64,${imageData}`);
    })
    .catch( error => {
      console.error( error );
    });   
  }

  getCurrentLocation () {
    this.loading = this.loadingCtrl.create ({
      message: this.i18n.buscando_ubicacion
    });
    
    this.loading.present ().then (() => {
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
      '21:00']

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
          need_supplies: value.need_supplies,
          need_medicine: value.need_medicine,
          hour: value.hour,
          note: value.note,
          latitude: this.latitude,
          longitude: this.longitude,
          imagenes: this.imagenes,
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
          tipo_comprobante: value.tipo_comprobante,
          ruc: value.ruc,
          razon_social: value.razon_social,
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

          this.database.updateHomeInjection (this.route.snapshot.paramMap.get ('id'), data).then ((response) => {
            let push_data = {
              titulo: 'Pedido de Inyección',
              detalle: 'Un pedido de Inyección fue corregido',
              destino: 'inyeccion',
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
          this.database.addHomeInjection (uid, data, this.pais_selected).then ((response) => {
            let push_data = {
              titulo: 'Pedido de Inyección',
              detalle: 'Un pedido de inyección fue solicitado',
              destino: 'inyeccion',
              mode: 'tags',
              clave: uid,
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
          });
        }
      });
    });
  }

  goBuy () {

  }

  imageView (myImage: any) {
    // const viewer = this.imageViewerCtrl.create(myImage);
    // viewer.present ();
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

  comprobanteChange (selectedValue: string) { 
    if (selectedValue === 'factura') {
      this.form.controls ['ruc'].setValidators (Validators.required);
      this.form.controls ['razon_social'].setValidators (Validators.required);
    } else {
      this.form.controls ['ruc'].setValidators ([]);
      this.form.controls ['ruc'].updateValueAndValidity ();

      this.form.controls ['razon_social'].setValidators ([]);
      this.form.controls ['razon_social'].updateValueAndValidity ();
    }
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
            } catch (error) {
              console.log (error);
            }
          }
        }
      ]
    });

    await confirm.present();
  }

  deleteImage (image: any) {
    this.imagenes.splice(this.imagenes.indexOf(image), 1);
  }

  change () {
    const value = this.form.value;

    if (value.has_all === true) {
      this.form.controls ['need_medicine'].setValue (false);
      this.form.controls ['need_supplies'].setValue (false);
    }
  }

  change2 () {
    /*
    const value = this.form.value;

    if (value.need_medicine === true || value.need_supplies === true) {
      this.form.controls ['has_all'].setValue (false);
    }
    */
  }

  goMedicoDomicilio () {
    this.navCtrl.navigateForward ("home-doctor");
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
