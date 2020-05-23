import { Component, OnInit, Input } from '@angular/core';
import { ModalController, NavController, LoadingController, AlertController, ActionSheetController } from '@ionic/angular';
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
              private pago: PagoService) {
  }

  ngOnInit () {
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
            des: 'Pago por servicio de delivery - CPS'
          };

          this.api.procesarPago2 (data).subscribe (async (response: any) => {
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
}
