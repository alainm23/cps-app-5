import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, NavParams, LoadingController, ActionSheetController, ModalController } from '@ionic/angular';

import { FormControl, FormGroup, Validators } from "@angular/forms";
// import { ImageViewerController } from "ionic-img-viewer";

import { DatabaseService } from '../../providers/database.service';
import { StorageService } from '../../providers/storage.service';
import { AuthService } from '../../providers/auth.service';
import { ApiService } from '../../providers/api.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { PaisesCodsPage } from '../../modals/paises-cods/paises-cods.page';

@Component({
  selector: 'app-request-results',
  templateUrl: './request-results.page.html',
  styleUrls: ['./request-results.page.scss'],
})
export class RequestResultsPage implements OnInit {
  form: FormGroup;
  is_edit: boolean = false;
  pais_selected: any = {
    name: "Peru",
    dial_code: "+51",
    code: "PE"
  };
  i18n: any; 
  constructor(public navCtrl: NavController, 
              private route: ActivatedRoute,
              public modalController: ModalController,
              private database: DatabaseService,
              private storage: StorageService,
              private translateService: TranslateService,
              private auth: AuthService,
              private api: ApiService,
              private alertCtrl: AlertController,
              // public imageViewerCtrl: ImageViewerController,
              private actionSheetCtrl: ActionSheetController,
              public loadingCtrl: LoadingController) {
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
      tipo_entrega: new FormControl ('recojo', [Validators.required]),
      correo: new FormControl (this.auth.user.email),
      message: new FormControl ("", [Validators.required]),
      fullname: new FormControl (this.auth.user.first_name + ' ' + this.auth.user.last_name, [Validators.required]),
      phone_number: new FormControl (phone_number, [Validators.required]),
      tipo_comprobante: new FormControl (null, [Validators.required]),
      ruc: new FormControl (''),
      razon_social: new FormControl (""),
      s_1: new FormControl (false, [Validators.required]),
      s_2: new FormControl (false, [Validators.required]),
      s_3: new FormControl (false, [Validators.required]),
      s_4: new FormControl (false, [Validators.required]),
      s_5: new FormControl (false, [Validators.required]),
      s_6: new FormControl (false, [Validators.required]),
      s_7: new FormControl (false, [Validators.required]),
      s_8: new FormControl (false, [Validators.required])  
    });

    this.storage.getValue ('i18n').then (i18n => {
      this.translateService.getTranslation (i18n).subscribe (async (i18n: any) => {
        this.i18n = i18n;
        
        const loading = await this.loadingCtrl.create ({
          message: this.i18n.procesando_informacion
        });
        
        await loading.present ().then (() => {
          if (this.route.snapshot.paramMap.get ('edit') === 'true') {
            this.is_edit = true;

            this.database.getRequestByKey (this.route.snapshot.paramMap.get ('id')).subscribe ((data: any) => {
              loading.dismiss ();
              
              this.form.controls ["correo"].setValue (data.user_email);
              this.form.controls ["fullname"].setValue (data.user_fullname);
              this.form.controls ["phone_number"].setValue (data.user_phone_number);
              this.form.controls ["tipo_entrega"].setValue (data.tipo_entrega);
              this.form.controls ["tipo_comprobante"].setValue (data.tipo_comprobante);
              this.form.controls ["ruc"].setValue (data.ruc);
              this.form.controls ["razon_social"].setValue (data.razon_social);
              this.form.controls ["message"].setValue (data.message);
              this.form.controls ["s_1"].setValue (data.s_1);
              this.form.controls ["s_2"].setValue (data.s_2);
              this.form.controls ["s_3"].setValue (data.s_3);
              this.form.controls ["s_4"].setValue (data.s_4);
              this.form.controls ["s_5"].setValue (data.s_5);
              this.form.controls ["s_6"].setValue (data.s_6);
              this.form.controls ["s_7"].setValue (data.s_7);
              this.form.controls ["s_8"].setValue (data.s_8);
              
              this.comprobanteChange (data.tipo_comprobante);
              this.onSegmentChange (data.tipo_entrega);
            });
          } else {
            loading.dismiss ();
          }
        });
      });
    });
  }

  goHome () {
    this.navCtrl.navigateRoot ('home'); 
  }

  async submit () {
    const value = this.form.value;

    if (value.laboratorio === false && value.copia_receta === false && value.rayos_x === false && value.copia_historial_clinica === false && value.tomografia === false) {
      const alert = await this.alertCtrl.create({
        header: this.i18n.Ningun_resultado_seleccionado,
        subHeader: this.i18n.Por_favor_seleccione,
        buttons: [this.i18n.OK]
      });

      alert.present();

    } else {
      const loading = await this.loadingCtrl.create ({
        message: this.i18n.procesando_informacion,
      });
      
      loading.present ();

      this.storage.getValue ("uid").then (uid => {
        this.storage.getValue ("token_id").then (token_id => {
          let data: any = {
            id: uid,
            token_id: token_id,
            date: new Date ().toISOString (),
            price: 0,

            s_1: value.s_1,
            s_2: value.s_2,
            s_3: value.s_3,
            s_4: value.s_4,
            s_5: value.s_5,
            s_6: value.s_6,
            s_7: value.s_7,
            s_8: value.s_8,

            tipo_entrega: value.tipo_entrega,
            message: value.message,
            deliver_date: '',
            is_checked: false,  
            is_paid: false,
            is_sent: false,
            is_delivered: false,
            state: 'created',
            last_message: '',
            transaccion_id: '',
            payment_type: '', //online, cash,
            why_canceled: '',
            who_canceled: '',
            who_canceled_name: '',
            canceled_date: '', 
            approved_date: '',
            completed_date: '',
            admi_id: '',
            user_id: uid,
            admi_name: '',
            tipo_comprobante: value.tipo_comprobante,
            ruc: value.ruc,
            razon_social: value.razon_social,
            user_phone_number: value.phone_number,
            user_fullname: value.fullname,
            user_email: value.correo,
            country_name: this.pais_selected.name,
            country_dial_code: this.pais_selected.dial_code,
            country_code: this.pais_selected.code,
         };

         if (this.is_edit) {
            data.id = this.route.snapshot.paramMap.get ('id');
            
            this.database.updateRequest (this.route.snapshot.paramMap.get ('id'), data).then ((response) => {
              let push_data = {
              titulo: 'Pedido de resultados',
              detalle: 'Un pedido de resultados fue corregido',
              destino: 'resultados',
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
            this.database.addRequest (uid, data, this.pais_selected).then ((response) => {
              let push_data = {
              titulo: 'Pedido de resultados',
              detalle: 'Un pedido de resultados fue solicitado',
              destino: 'resultados',
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

  onSegmentChange (selectedValue: string) {
    if (selectedValue === 'correo') {
      this.form.controls ['correo'].setValidators ([Validators.required, Validators.email]);
    } else {
      this.form.controls ['correo'].setValidators (null); 
    }
  }
}
