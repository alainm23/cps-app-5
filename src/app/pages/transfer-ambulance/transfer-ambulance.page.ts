import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, LoadingController } from '@ionic/angular';

import { FormControl, FormGroup, Validators} from "@angular/forms";

import { DatabaseService } from '../../providers/database.service';
import { StorageService } from '../../providers/storage.service';
import { AuthService } from '../../providers/auth.service';
import { ApiService } from '../../providers/api.service';

import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { PaisesCodsPage } from '../../modals/paises-cods/paises-cods.page';
import { MapSelectPage } from '../../modals/map-select/map-select.page'; 

@Component({
  selector: 'app-transfer-ambulance',
  templateUrl: './transfer-ambulance.page.html',
  styleUrls: ['./transfer-ambulance.page.scss'],
})
export class TransferAmbulancePage implements OnInit {
  latitude_ori: number = 0;
  longitude_ori: number = 0;

  latitude_des: number = 0;
  longitude_des: number = 0;
  
  form: FormGroup;

  editar_1: string;
  editar_2: string;

  loading: any;

  is_edit: boolean = false;

  pais_selected: any = {
    name: "Peru",
    dial_code: "+51",
    code: "PE"
  };
  
  ambulancia_des: string;
  min_date: string = new Date ().toISOString ();
  i18n: any;
  constructor(public navCtrl: NavController,
              private route: ActivatedRoute, 
              private loadingCtrl: LoadingController,
              private database: DatabaseService,
              private auth: AuthService,
              private api: ApiService,
              private storage: StorageService,
              private translateService: TranslateService,
              public modalController: ModalController) {
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

    this.form = new FormGroup ({
      address_ori: new FormControl ('', Validators.required),
      address_des: new FormControl ('', Validators.required),
      location_ori_lat: new FormControl (null, Validators.required),
      location_ori_lon: new FormControl (null, Validators.required),
      location_des_lat: new FormControl (null, Validators.required),
      location_des_lon: new FormControl (null, Validators.required),
      date: new FormControl (new Date ().toISOString (), Validators.required),
      tipo_ambulancia: new FormControl ("ambulancia_1", Validators.required),
      hour: new FormControl ('', Validators.required),
      phone_number: new FormControl (phone_number, [Validators.required]),
      tipo_comprobante: new FormControl ('boleta', Validators.required),
      ruc: new FormControl (""),
      razon_social: new FormControl (""),
      terms_conditions: new FormControl (false, Validators.compose([ Validators.required, Validators.pattern('true')]))
    });

    console.log (this.form);

    this.storage.getValue ('i18n').then (i18n => {
      this.translateService.getTranslation (i18n).subscribe (async (i18n: any) => {
        this.i18n = i18n;
        this.ambulancia_des = i18n.a_tipo_I;
  
        if (this.route.snapshot.paramMap.get ('edit') === 'true') {
          let loading = await this.loadingCtrl.create ({
            message: this.i18n.procesando_informacion
          });

          loading.present ();

          this.is_edit = true;
          
          this.database.getTransferAmbulanceByKey (this.route.snapshot.paramMap.get ('id')).subscribe ((data: any) => {
            loading.dismiss ();

            this.form.controls ["address_ori"].setValue (data.address_ori);
            this.form.controls ["address_des"].setValue (data.address_des);
            this.form.controls ["location_ori_lat"].setValue (data.location_ori_lat);
            this.form.controls ["location_ori_lon"].setValue (data.location_ori_lon);
            this.form.controls ["location_des_lat"].setValue (data.location_des_lat);
            this.form.controls ["location_des_lon"].setValue (data.location_des_lon);
            this.form.controls ["date"].setValue (data.date);
            this.form.controls ["hour"].setValue (data.hour);
            this.form.controls ["tipo_comprobante"].setValue (data.tipo_comprobante);
            this.form.controls ["ruc"].setValue (data.ruc);
            this.form.controls ["razon_social"].setValue (data.razon_social);

            this.comprobanteChange (data.tipo_comprobante);

            this.loading.dismiss ();
          });
        }
      });
    });
  }

  ngOnDestroy () {

  }

  goHome () {
    this.navCtrl.navigateRoot ('home');
  }

  async selectOrigen () {
    const value = this.form.value;

    const modal = await this.modalController.create({
      component: MapSelectPage,
      componentProps: {
        latitude: this.latitude_ori,
        longitude: this.longitude_ori,
        address: value.address_ori
      }
    });

    modal.onDidDismiss ().then ((response: any) => {
      if (response.role === 'ok') {
        this.latitude_ori = response.data.latitude;
        this.longitude_ori = response.data.longitude;

        this.editar_1 = this.i18n.Editar;
        
        this.form.controls ["location_ori_lat"].setValue (response.data.latitude);
        this.form.controls ["location_ori_lon"].setValue (response.data.longitude);
        this.form.controls ["address_ori"].setValue (response.data.address);
      }
    });

    return await modal.present();
  }

  async selectDestino () {
    const value = this.form.value;

    const modal = await this.modalController.create({
      component: MapSelectPage,
      componentProps: {
        latitude: this.latitude_des,
        longitude: this.longitude_des,
        address: value.address_des
      }
    });

    modal.onDidDismiss ().then ((response: any) => {
      if (response.role === 'ok') {
        this.latitude_des = response.data.latitude;
        this.longitude_des = response.data.longitude;

        this.editar_2 = this.i18n.Editar;
        
        this.form.controls ["location_des_lat"].setValue (response.data.latitude);
        this.form.controls ["location_des_lon"].setValue (response.data.longitude);
        this.form.controls ["address_des"].setValue (response.data.address);
      }
    });

    return await modal.present ();
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
      '23:00']

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
    let loading = await this.loadingCtrl.create({
      message: this.i18n.procesando_informacion
    });

    await loading.present ().then (() => {
      const value = this.form.value;

      this.storage.getValue ("uid").then ((uid) => {
        this.storage.getValue ("token_id").then (token_id => {
          let data: any = {
            id: uid,
            token_id: token_id,
            address_ori: value.address_ori,
            address_des: value.address_des,
            location_ori_lat: value.location_ori_lat,
            location_ori_lon: value.location_ori_lon,
            location_des_lat: value.location_des_lat,
            location_des_lon: value.location_des_lon,
            date: value.date,
            tipo_ambulancia: value.tipo_ambulancia,
            hour: value.hour,
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
            canceled_date: '',
            arrived_date: '',  
            approved_date: '',
            completed_date: '',
            created_date: new Date ().toISOString (),
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
            
            this.database.updateTransferAmbulance (this.route.snapshot.paramMap.get ('id'), data).then ((response) => {
              let push_data = {
                titulo: 'Solicitud de traslado en ambulancia',
                detalle: 'La solicitud de traslado en ambulancia fue corregido',
                destino: 'traslado',
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
          } else {
            this.database.addTransferAmbulance (uid, data, this.pais_selected).then ((response) => {
              let push_data = {
                titulo: 'Solicitud de traslado en ambulancia',
                detalle: 'Un pedido de traslado en ambulancia fue solicitado',
                destino: 'traslado',
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

  ambulanciaTipo (selectedValue: string) { 
    if (selectedValue === 'ambulancia_1') {
      this.ambulancia_des = this.i18n.a_tipo_I;
    } else if (selectedValue === 'ambulancia_2') {
      this.ambulancia_des = this.i18n.a_tipo_II;
    } else {
      this.ambulancia_des = this.i18n.a_tipo_III;
    }
  }
}
