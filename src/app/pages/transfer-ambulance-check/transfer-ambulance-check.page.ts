import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, AlertController, ActionSheetController, ModalController, ToastController } from '@ionic/angular';

import { PagoService } from '../../providers/pago.service';
import { DatabaseService } from '../../providers/database.service';
import { AuthService } from '../../providers/auth.service';
import { ApiService } from '../../providers/api.service';
import { StorageService } from '../../providers/storage.service';

import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core'; 
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { PayPage } from '../../modals/pay/pay.page';

@Component({
  selector: 'app-transfer-ambulance-check',
  templateUrl: './transfer-ambulance-check.page.html',
  styleUrls: ['./transfer-ambulance-check.page.scss'],
})
export class TransferAmbulanceCheckPage implements OnInit {
  loading: any;
  transfer_ambulance: any;
  amount: number;

  subscription_1: Subscription;
  subscription_2: Subscription;

  observations: any;
  i18n: any;
  constructor(public navCtrl: NavController,
              private route: ActivatedRoute,
              private database: DatabaseService,
              private storage: StorageService,
              private api: ApiService,
              private translateService: TranslateService,
              public auth: AuthService,
              public alertCtrl: AlertController,
              public loadingCtrl: LoadingController,
              public actionSheetCtrl: ActionSheetController,
              public modalController: ModalController,
              public toastController: ToastController,
              private pago: PagoService) {
  }

  async ngOnInit () {
    this.storage.getValue ('i18n').then (i18n => {
      this.translateService.getTranslation (i18n).subscribe (async (i18n: any) => {
        this.i18n = i18n;
        
        const loading = await this.loadingCtrl.create ({
          message: this.i18n.procesando_informacion
        });

        await loading.present ();

        if (this.route.snapshot.paramMap.get ('type') === 'canceled') {
          this.subscription_1 = this.database.getTransferAmbulanceCanceladoByKey (this.route.snapshot.paramMap.get ('id')).subscribe (data => {
            this.transfer_ambulance = data;
            loading.dismiss ();
          });
        } else if (this.route.snapshot.paramMap.get ('type') === 'finalized') {
          this.subscription_1 = this.database.getTransferAmbulanceFinalizadosByKey (this.route.snapshot.paramMap.get ('id')).subscribe (data => {
            this.transfer_ambulance = data;
            loading.dismiss ();
          });
        } else {
          this.subscription_1 = this.database.getTransferAmbulanceByKey (this.route.snapshot.paramMap.get ('id')).subscribe ((data: any) => {
            this.transfer_ambulance = data;
            loading.dismiss ();
            console.log (data);
          });

          this.subscription_2 = this.database.getTranferAmbulanceObservations (this.route.snapshot.paramMap.get ('id')).subscribe ((data: any) => {
            if (data) {
              this.observations = data;
            }
          });
        }
      });
    });
  }

  ngOnDestroy () {
    if (this.subscription_1 != undefined && this.subscription_1 != null) {
      this.subscription_1.unsubscribe ();
    }

    if (this.subscription_2 != undefined && this.subscription_2 != null) {
      this.subscription_2.unsubscribe ();
    }
  }

  goHome () {
    this.navCtrl.navigateRoot ('home');
  }

  getFormatDate (date: string) {
    return moment(date).format('LL');
  }
  
  getFormatPrice (price: number) {
    return (price / 100).toString (); 
  }

  getRelativeTime (time: number) {
    let n = time / 60;
    n = ~~n;
    return n.toString ();
  }

  edit () {
    this.navCtrl.navigateForward (['transfer-ambulance', this.route.snapshot.paramMap.get ('id'), 'true']);
  }

  async cancel () {
    const confirm = await this.alertCtrl.create({
      header: this.i18n.estas_seguro_cancelar_pedido,
      message: this.i18n.llenar_motivo_cancelacion,
      inputs: [
        {
          name: 'message',
          placeholder: this.i18n.motivo_cancelacion
        },
      ],
      buttons: [
        {
          text: this.i18n.No
        },
        {
          text: this.i18n.Si,
          handler: async (data) => {
            const loading = await this.loadingCtrl.create({
              message: this.i18n.procesando_informacion
            });

            loading.present ();

            this.transfer_ambulance.is_checked = true;
            this.transfer_ambulance.state = "canceled";
            this.transfer_ambulance.who_canceled = "user";
            this.transfer_ambulance.why_canceled = data.message;
            this.transfer_ambulance.last_message = data.message;
            this.transfer_ambulance.canceled_date = new Date ().toISOString ();

            this.database.updateTranferAmbulanceCanceled (this.transfer_ambulance.id, this.transfer_ambulance, this.observations ).then (async (response) => {
              loading.dismiss ();
              this.goHome ();

              const toast = await this.toastController.create({
                message: this.i18n.Tu_solicitud_fue_cancelada,
                color: 'success',
                position: 'top',
                duration: 2000
              });

              toast.present ();
                
              let push_data = {
                titulo: 'Solicitud cancelada',
                detalle: 'El usuario cancelo su solicitud de transferencia en ambulancia',
                destino: 'doctor',
                mode: 'tags',
                clave: 'clave',
                tokens: 'Administrador'
              };
  
              this.api.pushNotification (push_data).subscribe (async response => {
                console.log ("Notificacion Enviada...", response);
              }, error => {
                console.log ("Notificacion Error...", error);
              });
            });
          }
        }
      ]
    });
    confirm.present();
  }

  async presentActionSheet (mount: number) {
    const modal = await this.modalController.create({
      component: PayPage,
      componentProps: {
        mount: mount
      }
    });

    modal.onDidDismiss ().then (async (r: any) => {
      let response = r.data;

      if (r.role === 'response') {
        console.log (response);

        const loading = await this.loadingCtrl.create({
          message: this.i18n.procesando_informacion
        });

        loading.present ();

        if (response.type === 'contra_entrega') {
          await this.database.updateTransferAmbulanceContraEntrega (this.transfer_ambulance.id);
          loading.dismiss ();
          
          let push_data = {
            titulo: 'Solicitud de traslado en ambulancia',
            detalle: 'El usuario confirmó la solicitud con método de pago contraentrega',
            destino: 'traslado',
            mode: 'tags',
            clave: this.transfer_ambulance.id,
            tokens: 'Administrador'
          };

          this.api.pushNotification (push_data).subscribe (response => {
            console.log ("Notificacion Enviada...", response);
          }, error => {
            console.log ("Notificacion Error...", error);
          });
        } else if (response.type === 'venta_exitosa') {
          await this.database.updateTransferAmbulanceOnlinePaid (this.transfer_ambulance.id, response.transaccion_id);
          loading.dismiss ();

          const toast = await this.toastController.create({
            header: this.i18n.proceso_exitoso,
            message: response.message,
            duration: 2000,
            position: 'bottom',
            color: 'success'
          });
          
          toast.present();

          let push_data = {
            titulo: 'Solicitud de traslado en ambulancia',
            detalle: 'El usuario confirmó la solicitud con método de pago online',
            destino: 'traslado',
            mode: 'tags',
            clave: this.transfer_ambulance.id,
            tokens: 'Administrador,Farmacia'
          };

          this.api.pushNotification (push_data).subscribe (response => {
            console.log ("Notificacion Enviada...", response);
          }, error => {
            console.log ("Notificacion Error...", error);
          }); 
        } else if (response.type === 'venta_error') {
          loading.dismiss ();
          
          console.log (response.message)

          const alert = await this.alertCtrl.create({
            header: '¡Error!',
            message: response.message,
            buttons: [this.i18n.OK]
          });

          alert.present (); 
        } else if (response.type === 'error_api') {
          loading.dismiss ();

          console.log (response.message)

          const alert = await this.alertCtrl.create({
            header: '¡Error!',
            message: response.message,
            buttons: [this.i18n.OK]
          });

          alert.present ();
        } else {
          loading.dismiss ();
        }
      }
    });

    return await modal.present ();
  }
}
