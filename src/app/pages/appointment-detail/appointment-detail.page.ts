import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController } from '@ionic/angular';
 
// Database
import { DatabaseService } from '../../providers/database.service';
import { AuthService } from '../../providers/auth.service';

// Translate Service
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../../providers/storage.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-appointment-detail',
  templateUrl: './appointment-detail.page.html',
  styleUrls: ['./appointment-detail.page.scss'],
})
export class AppointmentDetailPage implements OnInit {
  appointment: any = {
    cliente_nombre: '',
    phone_number: '',
    nationality: '',
    email: '',
    address: '',
    message: '',
    price: '',
    specialty_name: '',
    date: '',
    hour: ''
  };

  constructor(public navCtrl: NavController,
              private route: ActivatedRoute,
              public loadingCtrl: LoadingController,
              private database: DatabaseService,
              private auth: AuthService,
              private translateService: TranslateService,
              private storage: StorageService, ) {
  }

  ngOnInit () {
    this.storage.getValue ('i18n').then (i18n => {
      this.translateService.getTranslation (i18n).subscribe (async (i18n: any) => {
        const loading = await this.loadingCtrl.create ({
          message: i18n.procesando_informacion
        });
        
        loading.present ();
        
        console.log ('data', this.route.snapshot.paramMap.get ("data"));
        let data = JSON.parse (this.route.snapshot.paramMap.get ("data"))

        if (data.data !== undefined && data.data !== null) {
          this.database.getAppointmentByKey (data.data).subscribe (d => {
            this.appointment = d;
          });
        } else {
          this.appointment.cliente_nombre = data.cliente_nombre;
          this.appointment.phone_number = data.phone_number;
          this.appointment.nationality = data.nationality;
          this.appointment.email = data.email;
          this.appointment.address = data.address;
          this.appointment.message = data.message;
          this.appointment.price = data.price;
          this.appointment.specialty_name = data.specialty_name;
          this.appointment.date = data.date;
          this.appointment.hour = data.hour;
        }

        loading.dismiss (); 
      });
    });
  }

  ngOnDestroy () {

  }
  
  goHome () {
    this.navCtrl.navigateRoot ('home'); 
  }
}
