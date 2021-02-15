import { Component, OnInit, Input } from '@angular/core';
import { ModalController, NavController, ToastController, LoadingController, AlertController, ActionSheetController } from '@ionic/angular';
// import { Events } from 'ionic-angular';
import { PagoService } from '../../providers/pago.service';

import { DatabaseService } from '../../providers/database.service';
import { AuthService } from '../../providers/auth.service';
import { ApiService } from '../../providers/api.service';
import { StorageService } from '../../providers/storage.service';
import { EventsService } from '../../providers/events.service';

import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { PaisesCodsPage } from '../../modals/paises-cods/paises-cods.page';

@Component({
  selector: 'app-pay',
  templateUrl: './pay.page.html',
  styleUrls: ['./pay.page.scss'],
})
export class PayPage implements OnInit {
  @Input () mount: number = 0;
  @Input () servicio: string = '';
  i18n: any;
  pago_subscribe: any;
  form: FormGroup;

  segment_value: boolean = false;
  ver_errores: boolean = false;
  constructor(public navCtrl: NavController, 
              private events: EventsService,
              private database: DatabaseService,
              private storage: StorageService,
              private api: ApiService,
              private translateService: TranslateService,
              public auth: AuthService,
              public alertCtrl: AlertController,
              public loadingCtrl: LoadingController,
              public actionSheetCtrl: ActionSheetController,
              public viewCtrl: ModalController,
              private pago: PagoService,
              private toastController: ToastController) {
  }

  ngOnInit () {
    let nombres = '';
    let apellidos = '';
    let email = '';
    let direccion = '';
    let pais = '';
    let ciudad = '';
    let telefono = '';
    let pais_code = '';

    if (this.auth.user.pagador_nombres !== null && this.auth.user.pagador_nombres !== undefined) {
      nombres = this.auth.user.pagador_nombres;
    } else {
      if (this.auth.user.first_name !== null && this.auth.user.first_name !== undefined) {
        nombres = this.auth.user.first_name;
      }
    }

    if (this.auth.user.pagador_apellidos !== null && this.auth.user.pagador_apellidos !== undefined) {
      apellidos = this.auth.user.pagador_apellidos;
    } else {
      if (this.auth.user.last_name !== null && this.auth.user.last_name !== undefined) {
        apellidos = this.auth.user.last_name;
      }
    }

    if (this.auth.user.pagador_email !== null && this.auth.user.pagador_email !== undefined) {
      email = this.auth.user.pagador_email;
    } else {
      if (this.auth.user.email !== null && this.auth.user.email !== undefined) {
        email = this.auth.user.email;
      }
    }

    if (this.auth.user.pagador_direccion !== null && this.auth.user.pagador_direccion !== undefined) {
      direccion = this.auth.user.pagador_direccion;
    }

    if (this.auth.user.pagador_pais !== null && this.auth.user.pagador_pais !== undefined) {
      pais = this.auth.user.pagador_pais;
    }

    if (this.auth.user.pagador_ciudad !== null && this.auth.user.pagador_ciudad !== undefined) {
      ciudad = this.auth.user.pagador_ciudad;
    }

    if (this.auth.user.pagador_telefono !== null && this.auth.user.pagador_telefono !== undefined) {
      telefono = this.auth.user.pagador_telefono;
    }

    if (this.auth.user.pagador_pais_code !== null && this.auth.user.pagador_pais_code !== undefined) {
      pais_code = this.auth.user.pagador_pais_code;
    }

    this.form = new FormGroup({
      nombres: new FormControl (nombres, [Validators.required]),
      apellidos: new FormControl (apellidos, [Validators.required]),
      email: new FormControl (email, [Validators.required, Validators.email]),
      direccion: new FormControl (direccion, [Validators.required]),
      pais: new FormControl (pais, [Validators.required]),
      ciudad: new FormControl (ciudad, [Validators.required]),
      telefono: new FormControl (telefono, [Validators.required]),
      pais_code: new FormControl (pais_code, [Validators.required]),
    });

    console.log (this.mount);
    this.storage.getValue ('i18n').then (i18n => {
      this.translateService.getTranslation (i18n).subscribe (async (i18n: any) => {
        this.i18n = i18n;

        const loading = await this.loadingCtrl.create ({
          message: this.i18n.procesando_informacion
        });
        

        loading.present ();

        loading.dismiss ().then (() => {
          this.pago.initCulqi ();
        });

        this.pago_subscribe = this.events.getObservable ().subscribe (async (token) => {
          const loading = await this.loadingCtrl.create({
            message: this.i18n.procesando_informacion
          });

          loading.present ();

          console.log ("Token:" +  token);

          let data: any = {
            token: token,
            monto: this.mount,
            correo: this.auth.user.email,
            moneda: 'PEN',
            des: 'Pago por servicio de delivery - CPS',
          };

          this.api.procesarPago2 (data, this.form.value).subscribe (async (response: any) => {
              console.log (response);

              if (response.estado === 1) {
                if (response.respuesta.outcome.type !== undefined && response.respuesta.outcome.type !== undefined && response.respuesta.outcome.type === 'venta_exitosa') {
                  loading.dismiss ();

                  let item: any = {
                    type: 'venta_exitosa',
                    transaccion_id: response.respuesta.id,
                    message: response.respuesta.outcome.user_message
                  };

                  this.viewCtrl.dismiss (item, 'response');
                } else {
                  loading.dismiss ();

                  let item: any = {
                    type: 'venta_error',
                    message: response.user_message
                  };
            
                  this.viewCtrl.dismiss (item, 'response');
                }  
              } else {
                loading.dismiss ();

                let item: any = {
                  type: 'venta_error',
                  message: response.respuesta.outcome.user_message
                };

                this.viewCtrl.dismiss (item, 'response');
              } 
          }, async error => {
            loading.dismiss ();

            console.log ('error', error);
            
            const confirm = await this.alertCtrl.create({
              header: this.i18n.Error_pago,
              message: this.i18n.Do_you_want_try_again,
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
                    this.openCulqi ();
                  }
                }
              ]
            });

            await confirm.present();
          });
        });
      });
    });  
  }

  ngOnDestroy () {
    this.pago_subscribe.unsubscribe ();
  }

  closeModal() {
    let item: any = {
      type: 'salir'
    };

    this.viewCtrl.dismiss (item, 'response');
  }

  async openCulqi () {
    this.pago.cfgFormulario ("Pago por servicio", this.mount);

    const loading = await this.loadingCtrl.create({
      message: this.i18n.procesando_informacion
    });

    loading.present ();

    loading.dismiss ().then (() => {
      this.pago.open ();
    })
  }

  async contraentrega () {
    const alert = await this.alertCtrl.create({
      header: 'Confirmación',
      message: '¿Esta seguro que desea continuar con este metodo de pago?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        }, {
          text: 'Confirmar',
          handler: () => {
            let item: any = {
              type: 'contra_entrega'
            };
        
            this.viewCtrl.dismiss (item, 'response');
          }
        }
      ]
    });

    await alert.present();
  }

  segmentChanged (event: any) {
    if (this.segment_value) {
      this.form.controls ['nombres'].setValidators ([]);
      this.form.controls ['apellidos'].setValidators ([]);
      this.form.controls ['email'].setValidators ([]);
      this.form.controls ['direccion'].setValidators ([]);
      this.form.controls ['pais'].setValidators ([]);
      this.form.controls ['ciudad'].setValidators ([]);
      this.form.controls ['pais_code'].setValidators ([]);
      this.form.controls ['telefono'].setValidators ([]);
    } else {
      this.form.controls ['nombres'].setValidators ([Validators.required]);
      this.form.controls ['apellidos'].setValidators ([Validators.required]);
      this.form.controls ['email'].setValidators ([Validators.required, Validators.email]);
      this.form.controls ['direccion'].setValidators ([Validators.required]);
      this.form.controls ['pais'].setValidators ([Validators.required]);
      this.form.controls ['ciudad'].setValidators ([Validators.required]);
      this.form.controls ['pais_code'].setValidators ([Validators.required]);
      this.form.controls ['telefono'].setValidators ([Validators.required]);
    }

    this.form.updateValueAndValidity ();
  }

  valid_button () {
    let returned: boolean = true;

    if (this.segment_value) {
      returned = false;
    } else {
      returned = this.form.invalid;
    }

    return returned;
  }

  async submit () {
    if (this.segment_value) {
      this.contraentrega ();
    } else {
      if (this.form.valid) {
        const loading = await this.loadingCtrl.create ({
          message: this.i18n.procesando_informacion
        });
  
        loading.present ();
  
        let request: any = {
          pagador_nombres: this.form.value.nombres,
          pagador_apellidos: this.form.value.apellidos,
          pagador_email: this.form.value.email,
          pagador_direccion: this.form.value.direccion,
          pagador_pais: this.form.value.pais,
          pagador_ciudad: this.form.value.ciudad,
          pagador_telefono: this.form.value.telefono,
          pagador_pais_code: this.form.value.pais_code
        };
  
        this.database.update_user (this.auth.user.id, request).then (() => {
          loading.dismiss ();
          this.openCulqi ();
        }, error => {
          console.log (error);
          loading.dismiss ();
          this.openCulqi ();
        });
      } else {
        const toast = await this.toastController.create({
          message: 'Complete todos los campos',
          duration: 2000
        });
        toast.present ();
        this.ver_errores = true;
      }
      
    }
  }

  async select_pais () {
    const modal = await this.viewCtrl.create({
      component: PaisesCodsPage
    });

    modal.onDidDismiss ().then (async (r: any) => {
      if (r.role === 'ok') {
        this.form.controls ['pais'].setValue (r.data.name);
        this.form.controls ['pais_code'].setValue (r.data.code);
      }
    });

    modal.present ();
  }
}
