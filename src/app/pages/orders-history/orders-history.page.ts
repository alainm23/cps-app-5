import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController } from '@ionic/angular';

import { DatabaseService } from '../../providers/database.service';
import { StorageService } from '../../providers/storage.service';

import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-orders-history',
  templateUrl: './orders-history.page.html',
  styleUrls: ['./orders-history.page.scss'],
})
export class OrdersHistoryPage implements OnInit {
  deliveries_cancelados: any;
  deliveries_finalizados: any;
  deliveries: any;

  home_injections_cancelados: any;
  home_injections_finalizados: any;
  home_injections: any;

  transf_ambulance_cancelados: any;
  transf_ambulance_finalizados: any;
  transf_ambulance: any;

  medical_cancelados: any;
  medical_finalizados: any;
  medical: any;

  home_pressure_cancelados: any;
  home_pressure_finalizados: any;
  home_pressure: any;

  home_doctor_cancelados: any;
  home_doctor_finalizados: any;
  home_doctor: any;

  deliveries_type: string = "f";
  home_injections_type: string = "f";
  transf_ambulance_type: string = "f";
  medical_type: string = "f";
  home_pressure_type: string = "f";
  home_doctor_type: string = "f";

  subscription_1: Subscription;
  subscription_2: Subscription;
  subscription_3: Subscription;
  subscription_4: Subscription;
  subscription_5: Subscription;
  subscription_6: Subscription;
  subscription_7: Subscription;
  subscription_8: Subscription;
  subscription_9: Subscription;
  subscription_10: Subscription;
  subscription_11: Subscription;
  subscription_12: Subscription;

  i18n: any;
  constructor(public navCtrl: NavController, 
              public loadingCtrl: LoadingController,
              private database: DatabaseService,
              private translateService: TranslateService,
              private storage: StorageService) {
  }

  async ngOnInit () {
    this.storage.getValue ('i18n').then (i18n => {
      this.translateService.getTranslation (i18n).subscribe (async (i18n: any) => {
        this.i18n = i18n;
        
        let loading = await this.loadingCtrl.create ({
          message: this.i18n.procesando_informacion
        });

        loading.present ();

        this.storage.getValue ("uid").then (async id => {
          this.subscription_1 = this.database.getFarmaciaCanceladoByUser (id).subscribe (data => {
            this.deliveries_cancelados = data;
            this.check_loading (loading);
          });

          this.subscription_2 = this.database.getFarmaciaFinalizadosByUser (id).subscribe (data => {
            this.deliveries_finalizados = data;
            this.deliveries = data;
            this.check_loading (loading);
          });

          this.subscription_3 = this.database.getHomeInjectionFinalizadosByUser (id).subscribe (data => {
            this.home_injections_finalizados = data;
            this.home_injections = data;
            this.check_loading (loading);
          });

          this.subscription_4 = this.database.getHomeInjectionCanceladoByUser (id).subscribe (data => {
            this.home_injections_cancelados = data;
            this.check_loading (loading);
          });
          
          this.subscription_5 = this.database.getTransferAmbulanceFinalizadosByUser (id).subscribe (data => {
            this.transf_ambulance_finalizados = data;
            this.transf_ambulance = data;
            this.check_loading (loading);
          });

          this.subscription_6 = this.database.getTransferAmbulanceCanceladoByUser (id).subscribe (data => {
            this.transf_ambulance_cancelados = data;
            this.check_loading (loading);
          });

          this.subscription_7 = this.database.getMedicalEscortsFinalizadosByUser (id).subscribe (data => {
            this.medical_finalizados = data;
            this.medical = data;
            this.check_loading (loading);
          });

          this.subscription_8 = this.database.getMedicalEscortsCanceladoByUser (id).subscribe (data => {
            this.medical_cancelados = data;
            this.check_loading (loading);
          });

          this.subscription_9 = this.database.getHomePressureFinalizadosByUser (id).subscribe (data => {
            this.home_pressure_finalizados = data;
            this.home_pressure = data;
            this.check_loading (loading);
          });

          this.subscription_10 = this.database.getHomePressureCanceladoByUser (id).subscribe (data => {
            this.home_pressure_cancelados = data;
            this.check_loading (loading);
          });

          this.subscription_11 = this.database.getHomeDoctorFinalizadosByUser (id).subscribe (data => {
            this.home_doctor_finalizados = data;
            this.home_doctor = data;
            this.check_loading (loading);
          });

          this.subscription_12 = this.database.getHomeDoctorCanceladoByUser (id).subscribe (data => {
            this.home_doctor_cancelados = data;
            this.check_loading (loading);
          });
        });
      });
    });
  }

  check_loading (loading: any) {
    if (this.subscription_1 !== null && this.subscription_2 !== null && this.subscription_3 !== null && this.subscription_4 !== null &&
      this.subscription_5 !== null && this.subscription_6 !== null && this.subscription_7 !== null && this.subscription_8 !== null &&
      this.subscription_9 !== null && this.subscription_10 !== null && this.subscription_11 !== null && this.subscription_12 !== null) {
        loading.dismiss ();
      }
  }

  ngOnDestroy () {
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

    if (this.subscription_10 != undefined && this.subscription_10 != null) {
      this.subscription_10.unsubscribe ();
    }

    if (this.subscription_11 != undefined && this.subscription_11 != null) {
      this.subscription_11.unsubscribe ();
    }

    if (this.subscription_12 != undefined && this.subscription_12 != null) {
      this.subscription_12.unsubscribe ();
    }
  }

  change (event: string, type: string) {
    if (type === 'farmacia') {
      if (event === 'f') {
        this.deliveries = this.deliveries_finalizados;
      } else {
        this.deliveries = this.deliveries_cancelados;
      }
    } else if (type === 'inyeccion') {
      if (event === 'f') {
        this.home_injections = this.home_injections_finalizados;
      } else {
        this.home_injections = this.home_injections_cancelados;
      }
    } else if (type === 'transf_ambulance') {
      if (event === 'f') {
        this.transf_ambulance = this.transf_ambulance_finalizados;
      } else {
        this.transf_ambulance = this.transf_ambulance_cancelados;
      }
    } else if (type === 'medical') {
      if (event === 'f') {
        this.medical = this.medical_finalizados;
      } else {
        this.medical = this.medical_cancelados;
      }
    } else if (type === 'home_pressure') {
      if (event === 'f') {
        this.home_pressure = this.home_pressure_finalizados;
      } else {
        this.home_pressure = this.home_pressure_cancelados;
      }
    } else if (type === 'home_doctor') {
      if (event === 'f') {
        this.home_doctor = this.home_doctor_finalizados;
      } else {
        this.home_doctor = this.home_doctor_cancelados;
     }
   }
  }

  goHome () {
    this.navCtrl.navigateRoot ('home');
  }

  goDeliveryCheck (data: any) {
    this.navCtrl.navigateForward (['pharmacy-delivery-check', data.id, data.state]);
  }

  goTransferAmbulances (data: any) {
    this.navCtrl.navigateForward (['transfer-ambulance-check', data.id, data.state]);
  }

  goMedicalEscorts (data: any) {
    this.navCtrl.navigateForward (['medical-escort-check', data.id, data.state]);
  }

  getFormatDate (date: string) {
    return moment(date).format ('LLL');
  }

  seeHomeInjection (data: any) {
    console.log (data);
  }

  goHomeIinjection (data: any) {
    this.navCtrl.navigateForward (['home-injection-check', data.id, data.state]);
  }

  goHomePressure (data: any) {
    this.navCtrl.navigateForward (['home-nurse-check', data.id, data.state]);
  }

  goHomeDoctor (data: any) {
    this.navCtrl.navigateForward (['home-doctor-check', data.id, data.state]);
  }
  
  goMedical (data: any) {
    this.navCtrl.navigateForward (['medical-escort-check', data.id, data.state]);
  }
}
