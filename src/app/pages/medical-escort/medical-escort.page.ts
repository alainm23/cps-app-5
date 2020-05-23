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
  selector: 'app-medical-escort',
  templateUrl: './medical-escort.page.html',
  styleUrls: ['./medical-escort.page.scss'],
})
export class MedicalEscortPage implements OnInit {
  number_patients = 0;

  latitude_ori: number = 0;
  longitude_ori: number = 0;

  latitude_des: number = 0;
  longitude_des: number = 0;

  form: FormGroup;

  editar_1: string;
  editar_2: string;

  terms_conditions: boolean;

  loading: any;
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
      location_ori_lat: new FormControl (0, Validators.required),
      location_ori_lon: new FormControl (0, Validators.required),
      location_des_lat: new FormControl (0, Validators.required),
      location_des_lon: new FormControl (0, Validators.required),
      //date: new FormControl (new Date ().toISOString (), Validators.required),
      //hour: new FormControl ('', Validators.required),
      description: new FormControl ('', Validators.required),
      need_doctor: new FormControl (false, Validators.required),
      need_nurse: new FormControl (false, Validators.required),
      
      need_paramedic: new FormControl (false, Validators.required),
      
      need_oxygen: new FormControl (false, Validators.required),
      need_spanish: new FormControl (false, Validators.required),
      need_english: new FormControl (false, Validators.required),
      
      number_patients: new FormControl ('', Validators.required),
      number_days: new FormControl ('', Validators.required),
      
      terms_conditions: new FormControl (false, Validators.compose([
        Validators.required,
        Validators.pattern('true')
      ])),
      phone_number: new FormControl (phone_number, [Validators.required]),
      tipo_comprobante: new FormControl ('boleta', Validators.required),
      ruc: new FormControl (""),
      razon_social: new FormControl ("")
    });

    this.storage.getValue ('i18n').then (i18n => {
      this.translateService.getTranslation (i18n).subscribe (async (i18n: any) => {
        this.i18n = i18n;
        
        if (this.route.snapshot.paramMap.get ('edit') === 'true') {
          let loading = await this.loadingCtrl.create ({
            message: this.i18n.procesando_informacion
          });

          loading.present ();

          this.is_edit = true;
          
          this.database.getMedicalEscortByKey (this.route.snapshot.paramMap.get ('id')).subscribe ((data: any) => {
            loading.dismiss ();

            this.form.controls ["address_ori"].setValue (data.address_ori);
            this.form.controls ["address_des"].setValue (data.address_des);
            this.form.controls ["location_ori_lat"].setValue (data.location_ori_lat);
            this.form.controls ["location_ori_lon"].setValue (data.location_ori_lon);
            this.form.controls ["location_des_lat"].setValue (data.location_des_lat);
            this.form.controls ["location_des_lon"].setValue (data.location_des_lon);
            //this.form.controls ["date"].setValue (data.date);
            //this.form.controls ["hour"].setValue (data.hour);
            this.form.controls ["description"].setValue (data.description);
            this.form.controls ["need_doctor"].setValue (data.need_doctor);
            this.form.controls ["need_nurse"].setValue (data.need_nurse);

            this.form.controls ["need_oxygen"].setValue (data.need_oxygen);
            this.form.controls ["need_spanish"].setValue (data.need_spanish);
            this.form.controls ["need_english"].setValue (data.need_english);
            this.form.controls ["number_patients"].setValue (data.number_patients);
            this.form.controls ["terms_conditions"].setValue (false);
            this.form.controls ["tipo_comprobante"].setValue (data.tipo_comprobante);
            this.form.controls ["ruc"].setValue (data.ruc);
            this.form.controls ["razon_social"].setValue (data.razon_social);

            this.form.controls ["need_paramedic"].setValue (data.need_paramedic);
            this.form.controls ["number_days"].setValue (data.number_days);

            this.comprobanteChange (data.tipo_comprobante);
            
            this.number_patients = data.number_patients;

            this.loading.dismiss ();
          });
        }
      });
    });
  }
  
  ngOnDestroy () {
  }

  increment () {
    this.number_patients++;

    this.updateCount ();
  }

  decrement () {
    if(this.number_patients > 0) {
      this.number_patients--;
    }

    this.updateCount ();
  }

  updateCount () {
    this.form.controls ["number_patients"].setValue (this.number_patients);
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
      '09:00 - 10:00',
      '10:00 - 11:00',
      '11:00 - 12:00',
      '12:00 - 13:00',
      '13:00 - 14:00',
      '14:00 - 15:00',
      '15:00 - 16:00',
      '16:00 - 17:00',
      '17:00 - 18:00',
      '18:00 - 19:00']

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
      this.storage.getValue ("uid").then ((id) => {
        this.storage.getValue ("token_id").then (async token_id => {
          const value = this.form.value;
          
          let lang: any = await this.storage.getValue ('i18n');
          if (lang === null || lang === undefined) {
            lang = 'es';
          }

          let data: any = {
            id: id,
            lang: lang,
            token_id: token_id,
            address_ori: value.address_ori,
            address_des: value.address_des,
            location_ori_lat: value.location_ori_lat,
            location_ori_lon: value.location_ori_lon,
            location_des_lat: value.location_des_lat,
            location_des_lon: value.location_des_lon,
            //date: value.date,
            //hour: value.hour,
            description: value.description,
            need_doctor: value.need_doctor,
            need_nurse: value.need_nurse,
            need_oxygen: value.need_oxygen,
            need_spanish: value.need_spanish,
            need_english: value.need_english,
            number_patients: value.number_patients,

            need_paramedic: value.need_paramedic,
            number_days: value.number_days,

            terms_conditions: value.terms_conditions,
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
          }

          if (this.route.snapshot.paramMap.get ('edit') === 'true') {
            data.id = this.route.snapshot.paramMap.get ('id');
            
            this.database.updateMedicalEscorts (this.route.snapshot.paramMap.get ('id'), data).then ((response) => {
              let push_data = {
                titulo: 'Solicitud de escolta medica',
                detalle: 'Un pedido de escolta medica fue corregido',
                destino: 'escolta',
                mode: 'tags',
                clave: id,
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
            this.database.addMedicalEscort (id, data, this.pais_selected).then ((response) => {
              let push_data = {
                titulo: 'Solicitud de escolta medica',
                detalle: 'Una solicitud de escolta medica fue solicitada',
                destino: 'escolta',
                mode: 'tags',
                clave: id,
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
    //console.log ("https://www.countryflags.io/" + this.pais_selected.code + "/flat/24.png");
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

  comprobanteChange (selectedValue: any) {
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
}
