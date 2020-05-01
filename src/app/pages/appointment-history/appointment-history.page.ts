import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController } from '@ionic/angular';

// Database
import { DatabaseService } from '../../providers/database.service';
import { AuthService } from '../../providers/auth.service';
import { StorageService } from '../../providers/storage.service';

// Translate Service
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-appointment-history',
  templateUrl: './appointment-history.page.html',
  styleUrls: ['./appointment-history.page.scss'],
})
export class AppointmentHistoryPage implements OnInit {
  loading: any;
  appointments: any;

  constructor(public navCtrl: NavController, 
              public loadingCtrl: LoadingController,
              private database: DatabaseService,
              private translateService: TranslateService,
              private storage: StorageService) {
  }

  async ngOnInit () {
    this.storage.getValue ('i18n').then (i18n => {
      this.translateService.getTranslation (i18n).subscribe (async (i18n: any) => {
        const loading = await this.loadingCtrl.create ({
          message: i18n.procesando_informacion
        });
        
        loading.present ().then (() => {
          this.storage.getValue ("uid").then ((id) => {
            this.database.getAppointmentsByUser (id).subscribe (data => {
              this.appointments = data;
              loading.dismiss ();
            });
          });
        });
      });
    });
  }

  ngOnDestroy () {

  }

  goHome () {
    this.navCtrl.navigateRoot ('home');
  }

  goAppointmentDetailPage (key: string) {
    this.navCtrl.navigateForward (['appointment-detail', JSON.stringify ({ data: key })]);
  }
}
