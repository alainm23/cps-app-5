import { Component, OnInit } from '@angular/core'; 
import { NavController, LoadingController, AlertController, ActionSheetController, ModalController } from '@ionic/angular';

import { PagoService } from '../../providers/pago.service';
import { DatabaseService } from '../../providers/database.service';
import { AuthService } from '../../providers/auth.service';
import { ApiService } from '../../providers/api.service';
import { StorageService } from '../../providers/storage.service';

import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment'; 
import { Subscription } from 'rxjs'; 
import { TranslateService } from '@ngx-translate/core'; 
import { PayPage } from '../../modals/pay/pay.page';

@Component({
  selector: 'app-home-injection-check',
  templateUrl: './home-injection-check.page.html',
  styleUrls: ['./home-injection-check.page.scss'],
})
export class HomeInjectionCheckPage implements OnInit {
  loading: any;
  home_injection: any;
  amount: number;

  observations: any;
  subscription_1: Subscription;
  subscription_2: Subscription;
  i18n: any;
  constructor(public navCtrl: NavController, 
              private route: ActivatedRoute,
              private database: DatabaseService,
              private storage: StorageService,
              private api: ApiService,
              public auth: AuthService,
              private translateService: TranslateService,
              public alertCtrl: AlertController,
              public loadingCtrl: LoadingController,
              public actionSheetCtrl: ActionSheetController,
              public modalController: ModalController,
              private pago: PagoService) {
  }

  ngOnInit () {
    this.storage.getValue ('i18n').then (i18n => {
      this.translateService.getTranslation (i18n).subscribe (async (i18n: any) => {
        this.i18n = i18n;
        
        const loading = await this.loadingCtrl.create ({
          message: this.i18n.procesando_informacion
        });

        await loading.present ();

        if (this.route.snapshot.paramMap.get ('type') === 'canceled') {
          this.subscription_1 = this.database.getHomeInjectionCanceladoByKey (this.route.snapshot.paramMap.get ('id')).subscribe (data => {
            this.home_injection = data;
            loading.dismiss ();
          });
        } else if (this.route.snapshot.paramMap.get ('type') === 'finalized') {
          this.subscription_1 = this.database.getHomeInjectionFinalizadosByKey (this.route.snapshot.paramMap.get ('id')).subscribe (data => {
            this.home_injection = data;
            loading.dismiss ();
          });
        } else {
          this.subscription_1 = this.database.getHomeInjection (this.route.snapshot.paramMap.get ('id')).subscribe ((data: any) => {
            this.home_injection = data;
            loading.dismiss ();
          });

          this.subscription_2 = this.database.getHomeInjectionObservations (this.route.snapshot.paramMap.get ('id')).subscribe ((data: any) => {
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
    this.navCtrl.navigateForward (['home-injection', this.route.snapshot.paramMap.get ('id'), 'true']);
  }

  async cancel () {
    const confirm = await this.alertCtrl.create({
      header: this.i18n.estas_seguro_cancelar_pedido,
      message: '',
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

            await loading.present ();

            this.home_injection.is_checked = true;
            this.home_injection.state = "canceled";
            this.home_injection.who_canceled = "user";
            this.home_injection.why_canceled = data.message;
            this.home_injection.last_message = data.message;
            this.home_injection.canceled_date = new Date ().toISOString ();

            this.database.updateHomeInjectionCanceled (this.home_injection.id, this.home_injection, this.observations ).then ((response) => {
              loading.dismiss ();
              this.goHome ();
            });
          }
        }
      ]
    });

    await confirm.present();
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
          await this.database.updateHomeInjectionContraEntrega (this.home_injection.id);
          loading.dismiss ();

          const alert = await this.alertCtrl.create({
            header: this.i18n.proceso_exitoso,
            message: response.message,
            buttons: [this.i18n.OK]
          });

          alert.present();

          let push_data = {
            titulo: 'Pedido de Inyeccion',
            detalle: 'Un pedido de inyeccion fue pagado',
            destino: 'farmacia',
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
          await this.database.updateHomeInjectionOnlinePaid (this.home_injection.id, response.transaccion_id);
          loading.dismiss ();

          const alert = await this.alertCtrl.create({
            header: this.i18n.proceso_exitoso,
            message: response.message,
            buttons: [this.i18n.OK]
          });

          alert.present();

          let push_data = {
            titulo: 'Pedido de Inyeccion',
            detalle: 'Un pedido de inyeccion fue pagado',
            destino: 'inyeccion',
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

          alert.present ();
        } else {
          loading.dismiss ();
        }
      }
    });

    return await modal.present ();
  }
}
