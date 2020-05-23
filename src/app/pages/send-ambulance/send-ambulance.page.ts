import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, Platform, ModalController, AlertController } from '@ionic/angular';

import { FormControl, FormGroup, Validators } from "@angular/forms";

import { Geolocation } from '@ionic-native/geolocation/ngx';  
// import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationEvents, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation/ngx';

import { DatabaseService } from '../../providers/database.service';
import { AuthService } from '../../providers/auth.service';
import { StorageService } from '../../providers/storage.service';
import { ApiService } from '../../providers/api.service';

import { Device } from '@ionic-native/device/ngx';

declare var google: any;

// Modals
import { MapSelectPage } from '../../modals/map-select/map-select.page';
import { PaisesCodsPage } from '../../modals/paises-cods/paises-cods.page';

@Component({
  selector: 'app-send-ambulance',
  templateUrl: './send-ambulance.page.html',
  styleUrls: ['./send-ambulance.page.scss'],
})
export class SendAmbulancePage implements OnInit {
  loading: any;

  latitude: number = 0;
  longitude: number = 0;

  pais_selected: any = {
    name: "Peru",
    dial_code: "+51",
    code: "PE"
  };

  form: FormGroup;
  user_id: string;
  editar_1: string;
  directionsService: any = new google.maps.DirectionsService ();
  constructor(public navCtrl: NavController, 
              private database: DatabaseService,
              private device: Device,
              public platform: Platform, 
              public auth: AuthService,
              public modalController: ModalController,
              public alertCtrl: AlertController,
              private storage: StorageService,
              public loadingCtrl: LoadingController, 
              private geolocation: Geolocation,
              // private backgroundGeolocation: BackgroundGeolocation,
              private api: ApiService) {
  }

  ngOnInit () {
    let phone_number;

    if (this.auth.is_logged) {
      if (this.auth.user.country_name !== '' && this.auth.user.country_dial_code !== '' && this.auth.user.country_code !== '') {
        this.pais_selected.name = this.auth.user.country_name;
        this.pais_selected.dial_code = this.auth.user.country_dial_code;
        this.pais_selected.code = this.auth.user.country_code;
        phone_number = this.auth.user.phone_number;
      }
    } else {
      phone_number = "";
    }

    this.form = new FormGroup({
      phone_number: new FormControl (phone_number, [Validators.required]),
      address: new FormControl ("", [Validators.required]),
      latitude: new FormControl (0, [Validators.required]),
      longitude: new FormControl (0, [Validators.required])
    });

    this.storage.getValue ("uid").then (id => {
      this.user_id = id;
    }); 

    this.getFlat ();
  }

  ngOnDestroy () {

  }
  
  async goConfirmAmbulance () {
    const loading = await this.loadingCtrl.create ({
      message: '...'
    });
    
    const value = this.form.value;

    let id;
    if (this.auth.is_logged) {
      id = this.user_id;
    } else {
      id = this.device.uuid
    }

    this.storage.getValue ("token_id").then (async token_id => {
      let lang: any = await this.storage.getValue ('i18n');
      if (lang === null || lang === undefined) {
        lang = 'es';
      }

      let data: any = {
        id: id,
        token_id: token_id,
        phone_number: value.phone_number,
        address: value.address,
        latitude: this.latitude,
        longitude: this.longitude,
        date: new Date ().toISOString (),
        ambulance_ori_lat: 0,
        ambulance_ori_lon: 0,
        who_canceled: '',// user, admi
        why_canceled: '',
        ambulance_id: '',
        driver_id: '',
        admi_id: '',
        admi_name: '',
        state: 'created', //created, approved, canceled, sent, finalized
        user_fullname: this.auth.user.first_name + " " + this.auth.user.last_name,
        user_email: this.auth.user.email,
        country_name: this.pais_selected.name,
        country_dial_code: this.pais_selected.dial_code,
        country_code: this.pais_selected.code,
        solicitante: 'usuario',
        lang: lang
      }

      console.log (data);

      let save_number: boolean;
      if (this.auth.is_logged) {
        if (this.auth.user.phone_number !== value.phone_number) {
          save_number = true;
        } else {
          save_number = false;
        }
      } else {
        save_number = false;
      }

      await loading.present ().then (() => {
        this.database.addSendAmbulance (data, data.id, save_number).then ((response: any) => {
          let push_data = {
            titulo: 'Emergencia',
            detalle: 'Se solicito una ambulancia',
            destino: 'ambulance-check',
            mode: 'tags',
            clave: data.id,
            tokens: 'Administrador,Admision'
          };

          this.api.pushNotification (push_data).subscribe (response => {
            console.log ("Notificacion Enviada...", response);
            loading.dismiss ();
            this.navCtrl.navigateRoot ('home');
          }, error => {
            console.log ("Notificacion Error...", error);
            loading.dismiss ();
            this.navCtrl.navigateRoot ('home');
          });
        }, error => {
          loading.dismiss ();
        });
      });
    });
  }

  getFlat () {
    return "https://www.countryflags.io/" + this.pais_selected.code + "/flat/24.png";
  }

  goHome () {
    this.navCtrl.navigateRoot ('home');
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

  async selectOrigen () {
    const value = this.form.value;

    const modal = await this.modalController.create({
      component: MapSelectPage,
      componentProps: {
        latitude: this.latitude,
        longitude: this.longitude,
        address: value.address
      }
    });

    modal.onDidDismiss ().then ((response: any) => {
      if (response.role === 'ok') {
        this.latitude = response.data.latitude;
        this.longitude = response.data.longitude;
        
        this.editar_1 = "(Editar)";

        this.form.controls ['latitude'].setValue (response.data.latitude);
        this.form.controls ['longitude'].setValue (response.data.longitude);
        this.form.controls ["address"].setValue (response.data.address);
      }
    });

    return await modal.present();

    // const value = this.form.value;

    // let myModal = this.modalCtrl.create("MapSelectPage", {
    //   latitude: this.latitude,
    //   longitude: this.longitude,
    //   address: value.address
    // });

    // myModal.onDidDismiss(data => {
    //   if (data) {
    //     
    //   }
    // });

    // myModal.present();
  }
}
