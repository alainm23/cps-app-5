import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, AlertController, ActionSheetController, ModalController } from '@ionic/angular';

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
  selector: 'app-medical-escort-check',
  templateUrl: './medical-escort-check.page.html',
  styleUrls: ['./medical-escort-check.page.scss'],
})
export class MedicalEscortCheckPage implements OnInit {
  loading: any;
  amount: number;
  medical_escort: any;

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
              private pago: PagoService) {
  }

  ngOnInit () {
    this.storage.getValue ('i18n').then (i18n => {
      this.translateService.getTranslation (i18n).subscribe (async (i18n: any) => {
        this.i18n = i18n;
        
        const loading = await this.loadingCtrl.create ({
          message: this.i18n.procesando_informacion
        });

        await loading.dismiss ();

        if (this.route.snapshot.paramMap.get ('type') === 'canceled') {
          this.subscription_1 = this.database.getMedicalEscortsCanceladoByKey (this.route.snapshot.paramMap.get ('id')).subscribe (data => {
            this.medical_escort = data;
            loading.dismiss ();
          });
        } else if (this.route.snapshot.paramMap.get ('type') === 'finalized') {
          this.subscription_1 = this.database.getMedicalEscortsFinalizadosByKey (this.route.snapshot.paramMap.get ('id')).subscribe (data => {
            this.medical_escort = data;
            loading.dismiss ();
          });
        } else {
          this.subscription_1 = this.database.getMedicalEscortByKey (this.route.snapshot.paramMap.get ('id')).subscribe ((data: any) => {
            this.medical_escort = data;
            loading.dismiss ();
          });

          this.subscription_2 = this.database.getMedicalEscortsObservations (this.route.snapshot.paramMap.get ('id')).subscribe ((data: any) => {
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

  edit (id: string) {
    this.navCtrl.navigateForward (['medical-escort', this.route.snapshot.paramMap.get ('id'), 'true']);
  }

  async cancel (id: string) {
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

            loading.present ();

            this.medical_escort.is_checked = true;
            this.medical_escort.state = "canceled";
            this.medical_escort.who_canceled = "user";
            this.medical_escort.why_canceled = data.message;
            this.medical_escort.last_message = data.message;
            this.medical_escort.canceled_date = new Date ().toISOString ();

            this.database.updateMedicalEscortsCanceled (this.medical_escort.id, this.medical_escort, this.observations ).then ((response) => {
              loading.dismiss ();
              this.goHome ();
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
          await this.database.updateMedicalEscortContraEntrega (this.medical_escort.id);
          const alert = await this.alertCtrl.create({
            header: this.i18n.proceso_exitoso,
            message: response.message,
            buttons: [this.i18n.OK]
          });

          alert.present ();

          let push_data = {
            titulo: 'Pedido de escolta medica',
            detalle: 'Un pedido de escolta medica fue pagado',
            destino: 'escolta',
            mode: 'tags',
            clave: this.medical_escort.id,
            tokens: 'Administrador'
          };

          this.api.pushNotification (push_data).subscribe (response => {
            console.log ("Notificacion Enviada...", response);
          }, error => {
            console.log ("Notificacion Error...", error);
          });
        } else if (response.type === 'venta_exitosa') {
          await this.database.updateMedicalEscortOnlinePaid (this.medical_escort.id, response.transaccion_id);
          loading.dismiss ();

          const alert = await this.alertCtrl.create({
            header: this.i18n.proceso_exitoso,
            message: response.message,
            buttons: [this.i18n.OK]
          });

          alert.present();

          let push_data = {
            titulo: 'Pedido de escolta medica',
            detalle: 'Un pedido de escolta medica fue pagado',
            destino: 'escolta',
            mode: 'tags',
            clave: this.medical_escort.id,
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
