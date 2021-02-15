import { Component, OnInit } from '@angular/core';

import { Platform, LoadingController, AlertController, ModalController, NavController } from '@ionic/angular';


// Database
import { DatabaseService } from '../../providers/database.service';
import { AuthService } from '../../providers/auth.service';
import { StorageService } from '../../providers/storage.service';

import { Geolocation } from '@ionic-native/geolocation/ngx';

// Device
import { Device } from '@ionic-native/device/ngx';
import { Subscription } from 'rxjs';
import { EventsService } from '../../providers/events.service';
import { TranslateService } from '@ngx-translate/core';
import { first, map } from 'rxjs/operators';

//Modals
import { CalificacionPage } from '../../modals/calificacion/calificacion.page';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  loading: any;

  ambulance_object: any;
  ambulance_device_object: any;
  delivery_object: any;
  injection_object: any;
  transfer_ambulance: any;
  medical: any;
  home_pressure: any;  
  home_doctor: any;
  request: any;

  para_calificar: any [];

  subscription_1: Subscription = null;
  subscription_2: Subscription = null;
  subscription_3: Subscription = null;
  subscription_4: Subscription = null;
  subscription_5: Subscription = null;
  subscription_6: Subscription = null;
  subscription_7: Subscription = null;
  subscription_8: Subscription = null;
  subscription_9: Subscription = null;

  i18n: any;
  
  user_uid: string;

  constructor(private platform: Platform,
              private device: Device,
              public alertCtrl: AlertController, 
              public auth: AuthService,
              private events: EventsService,
              private translateService: TranslateService,
              private navCtrl: NavController,
              private storage: StorageService,
              private geolocation: Geolocation,
              public modalController: ModalController,
              public loadingCtrl: LoadingController,
              private database: DatabaseService) {
  }
  
  ionViewDidEnter () {
    this.storage.getValue ('i18n').then (i18n => {
      console.log ('i18n', i18n);

      let lang: string = i18n;

      if (lang === null || lang === undefined) {
        lang = 'es';
      }

      this.translateService.getTranslation (lang).subscribe (async (i18n: any) => {
        this.i18n = i18n;
        
        const loading = await this.loadingCtrl.create ({
          message: this.i18n.procesando_informacion
        });

        loading.present ();

        this.auth.getUsuario ().subscribe (async (response: any) => {
          if (response) {
            this.user_uid = response.uid;

            this.subscription_1 = this.database.getSendAmbulance (response.uid).subscribe (data => {
              this.ambulance_object = data;
              this.check_loading (loading);
            });

            this.subscription_2 = this.database.getDelivery (response.uid).subscribe (data => {
              this.delivery_object = data;
              this.check_loading (loading);
            });

            this.subscription_3 = this.database.getHomeInjection (response.uid).subscribe (data => {
              this.injection_object = data;
              this.check_loading (loading);
            });

            this.subscription_4 = this.database.getTransferAmbulanceByKey (response.uid).subscribe (data => {
              this.transfer_ambulance = data;
              this.check_loading (loading);
            });

            this.subscription_5 = this.database.getMedicalEscortByKey (response.uid).subscribe (data => {
              this.medical = data;
              this.check_loading (loading);
            });

            this.subscription_6 = this.database.getHomePressureByKey (response.uid).subscribe (data => {
              this.home_pressure = data;
              this.check_loading (loading);
            });

            this.subscription_7 = this.database.getHomeDoctorByKey (response.uid).subscribe (data => {
              this.home_doctor = data;
              this.check_loading (loading);
            });

            this.subscription_8 = this.database.getRequestByKey (response.uid).subscribe (data => {
              this.request = data;
              this.check_loading (loading);
            });

            this.subscription_9 = this.database.getParaCalificar (response.uid).subscribe (data => {
              this.para_calificar = data;
              this.check_loading (loading);
            });
          } else {
            try {
              this.database.getSendAmbulance (this.device.uuid).subscribe (async data => {
                this.ambulance_object = data;
                loading.dismiss ();
              });
            } catch (e) {
              console.log (e);
              loading.dismiss ();
            }
          }
        }, error => {
          console.log (error);
          loading.dismiss ();
        });

        this.events.getObservableDeslogeado ().subscribe (() => {
          this.clear_all ();
        });
      });
    });
  }

  ngOnInit () {
    
  }

  check_loading (loading: any) {
    if (this.subscription_1 !== null && this.subscription_2 !== null && this.subscription_3 !== null && this.subscription_4 !== null &&
      this.subscription_5 !== null && this.subscription_6 !== null && this.subscription_7 !== null && this.subscription_8 !== null &&
      this.subscription_9 !== null) {
        loading.dismiss ();
      }
  }

  ionViewDidLeave () {
    if (this.subscription_1 != undefined && this.subscription_1 != null) {
      this.subscription_1.unsubscribe ();
    }

    if (this.subscription_2 != undefined && this.subscription_2 != null) {
      this.subscription_2.unsubscribe ();
    }

    if (this.subscription_3 != undefined && this.subscription_3 != null) {
      this.subscription_3.unsubscribe ();
    }

    if (this.subscription_4 != undefined && this.subscription_4 != null) {
      this.subscription_4.unsubscribe ();
    }

    if (this.subscription_5 != undefined && this.subscription_5 != null) {
      this.subscription_5.unsubscribe ();
    }

    if (this.subscription_6 != undefined && this.subscription_6 != null) {
      this.subscription_6.unsubscribe ();
    }

    if (this.subscription_7 != undefined && this.subscription_7 != null) {
      this.subscription_7.unsubscribe ();
    }

    if (this.subscription_8 != undefined && this.subscription_8 != null) {
      this.subscription_8.unsubscribe ();
    }

    if (this.subscription_9 != undefined && this.subscription_9 != null) {
      this.subscription_9.unsubscribe ();
    }
  }
  clear_all () {
    this.ambulance_object = null;
    this.delivery_object = null;
    this.injection_object = null;
    this.transfer_ambulance = null;
    this.medical = null;
    this.home_pressure = null;
    this.home_doctor = null;
    this.request = null;
  }
  
  goEmergencyPage () {
    this.navCtrl.navigateForward ('emergency');
  }

  async goPage (page: string) {
    const loading = await this.loadingCtrl.create ({
      message: 'Procesando...'
    });
    
    await loading.present ();

    const user = await this.auth.isLogin ();

    await loading.dismiss ();

    if (user) {
      if (page === 'appointment-specialty') {
        this.navCtrl.navigateForward ('appointment-specialty');
      } else {
        this.navCtrl.navigateForward ([page, 'xyz', 'false']);
      }
    } else {
      console.log (this.i18n.ingresar)

      let alert = this.alertCtrl.create({
        header: this.i18n.ingresar,
        message: this.i18n.ingresa_tus_datos,
        buttons: [
          {
            text: this.i18n.CANCEL,
            role: 'cancel'
          },
          {
            text: this.i18n.ingresar,
            handler: () => {
              this.navCtrl.navigateForward ("login");
            }
          }
        ]
      });

      (await alert).present ();
    }
  }

  seeSendAmbulance () {
    this.navCtrl.navigateForward (['confirm-ambulance', this.ambulance_object.id]);
  }

  seeHomeInjection () {
    this.storage.getValue ("uid").then (id => {
      this.navCtrl.navigateForward (['home-injection-check', id, 'created']);
    });
  }

  seeDelivery () {
    this.storage.getValue ("uid").then (id => {
      this.navCtrl.navigateForward (['pharmacy-delivery-check', id, 'created']);
    });
  }

  seeTransferAmbulance () {
    this.storage.getValue ("uid").then (id => {
      this.navCtrl.navigateForward (['transfer-ambulance-check', id, 'created']);
    });
  }

  seeMedical () {
    this.storage.getValue ("uid").then (id => {
      this.navCtrl.navigateForward (['medical-escort-check', id, 'created']);
    });
  }

  seeHomePressure () {
    this.storage.getValue ("uid").then (id => {
      this.navCtrl.navigateForward (['home-nurse-check', id, 'created']);
    });
  }
  
  seeHomeDoctor () {
    this.storage.getValue ("uid").then (id => {
      this.navCtrl.navigateForward (['home-doctor-check', id, 'created']);
    });
  }
  
  seeRequest () {
    this.storage.getValue ("uid").then (id => {
      this.navCtrl.navigateForward (['request-results-check', id, 'created']);
    });
  }

  goBlogNews () {
    this.storage.getValue ("i18n").then ((lang) => {
      if (lang === 'es') {
        window.open ("https://cps.com.pe/es/articles", "_blank", "location=yes");
      } else {
        window.open ("https://cps.com.pe/articles", "_blank", "location=yes");
      }
    });
  }

  async calificar (item: any) {
    const modal = await this.modalController.create({
      component:CalificacionPage,
    });

    modal.onDidDismiss ().then (async (response: any) => {
      if (response.role == 'ok') {
        const loading = await this.loadingCtrl.create ({
          message: this.i18n.procesando_informacion
        });

        loading.present ();

        this.database.addComentario (item, response.data, this.user_uid)
          .then (() => {
            loading.dismiss ();
          }, error => {

          }); 
      }
    });

    return await modal.present ();
  }

  async cancelCalificacion (item) {
    const loading = await this.loadingCtrl.create ({
      message: this.i18n.procesando_informacion
    });

    await loading.present ();

    this.database.cancelarComentario (item, this.user_uid)
      .then (() => {
        loading.dismiss ();
      }, error => {

      });
  }
}
