import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, LoadingController, AlertController, ToastController } from '@ionic/angular';

import { FormControl, FormGroup, Validators} from "@angular/forms";

import { DatabaseService } from '../../providers/database.service';
import { StorageService } from '../../providers/storage.service';
import { AuthService } from '../../providers/auth.service';
import { ApiService } from '../../providers/api.service';

import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { PaisesCodsPage } from '../../modals/paises-cods/paises-cods.page';
import { MapSelectPage } from '../../modals/map-select/map-select.page'; 
import * as moment from 'moment';
import { PayPage } from '../../modals/pay/pay.page';
@Component({
  selector: 'app-request-results-check',
  templateUrl: './request-results-check.page.html',
  styleUrls: ['./request-results-check.page.scss'],
})
export class RequestResultsCheckPage implements OnInit {
  home_injection: any;
  amount: number;

  observations: any;
  subscription_1: any;
  subscription_2: any;

  i18n: any;
  constructor(public navCtrl: NavController,
    private route: ActivatedRoute, 
    private loadingCtrl: LoadingController,
    private database: DatabaseService,
    public auth: AuthService,
    private api: ApiService,
    private storage: StorageService,
    public toastController: ToastController,
    private alertCtrl: AlertController,
    private translateService: TranslateService,
    public modalController: ModalController) {
  }

  ngOnInit () {
    this.storage.getValue ('i18n').then (i18n => {
      this.translateService.getTranslation (i18n).subscribe (async (i18n: any) => {
        this.i18n = i18n;
        
        const loading = await this.loadingCtrl.create ({
          message: this.i18n.procesando_informacion
        });

        loading.present ();

        if (this.route.snapshot.paramMap.get ('type') === 'canceled') {
          this.subscription_1 = this.database.getRequestCanceladoByKey (this.route.snapshot.paramMap.get ("id")).subscribe (data => {
            this.home_injection = data;
            loading.dismiss ();
          });
        } else if (this.route.snapshot.paramMap.get ('type') === 'finalized') {
          this.subscription_1 = this.database.getRequestFinalizadosByKey (this.route.snapshot.paramMap.get ("id")).subscribe (data => {
            this.home_injection = data;
            loading.dismiss ();
          });
        } else {
          this.subscription_1 = this.database.getRequestByKey (this.route.snapshot.paramMap.get ("id")).subscribe ((data: any) => {
            this.home_injection = data;
            loading.dismiss ();
            console.log (data);
          });

          this.subscription_2 = this.database.getRequestObservations (this.route.snapshot.paramMap.get ("id")).subscribe ((data: any) => {
            if (data) {
              this.observations = data;
            }
          });
        }
      });
    });
  }

  edit () {
    this.navCtrl.navigateForward (['request-results', this.route.snapshot.paramMap.get ('id'), 'true']);
  }

  goHome () {
    this.navCtrl.navigateRoot ('home');
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

            this.home_injection.is_checked = true;
            this.home_injection.state = "canceled";
            this.home_injection.who_canceled = "user";
            this.home_injection.why_canceled = data.message;
            this.home_injection.last_message = data.message;
            this.home_injection.canceled_date = new Date ().toISOString ();

            this.database.updateRequestCanceled (this.home_injection.id, this.home_injection, this.observations ).then (async (response) => {
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
                detalle: 'El usuario cancelo su solicitud de resultado',
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

  getFormatDate (date: string) {
    return moment (date).format('LL');
  }

  getFormatDateTime (date: string) {
    return moment (date).format('lll');
  }
  
  getFormatPrice (price: number) {
    return (price / 100).toString (); 
  }

  getRelativeTime (time: number) {
    let n = time / 60;
    n = ~~n;
    return n.toString ();
  }

  async presentActionSheet (mount: number) {
    console.log (mount);

    const modal = await this.modalController.create({
      component: PayPage,
      componentProps: {
        mount: mount,
        servicio: 'resultados'
      }
    });

    modal.onDidDismiss ().then (async (r: any) => {
      let response = r.data;

      if (r.role === 'response') {
        console.log (response);

        const loading = await this.loadingCtrl.create({
          message: "Procesando informacion..."
        });

        loading.present ();

        if (response.type === 'contra_entrega') {
          await this.database.updateRequestContraEntrega (this.home_injection.id);
          loading.dismiss ();

          let push_data = {
            titulo: 'Solicitud de resultados',
            detalle: 'El usuario confirmó la solicitud con método de pago contraentrega',
            destino: 'resultados',
            mode: 'tags',
            clave: this.home_injection.id,
            tokens: 'Administrador'
          };

          this.api.pushNotification (push_data).subscribe (response => {
            console.log ("Notificacion Enviada...", response);
          }, error => {
            console.log ("Notificacion Error...", error);
          });
        } else if (response.type === 'venta_exitosa') {
          await this.database.updateRequestOnlinePaid (this.home_injection.id, response.transaccion_id);
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
            titulo: 'Solicitud de resultados',
            detalle: 'El usuario confirmó la solicitud con método de pago online',
            destino: 'resultados',
            mode: 'tags',
            clave: this.home_injection.id,
            tokens: 'Administrador'
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

          alert.present(); 
        } else if (response.type === 'error_api') {
          loading.dismiss ();

          console.log (response.message)

          const alert = await this.alertCtrl.create({
            header: '¡Error!',
            message: response.message,
            buttons: [this.i18n.OK]
          });

          alert.present();
        } else {
          loading.dismiss ();
        }
      }
    });

    return await modal.present ();
  }
}
