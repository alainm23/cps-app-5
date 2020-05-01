import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ModalController, AlertController } from '@ionic/angular';

//import { Events } from 'ionic-angular'; 

import { CurrencyPipe } from '@angular/common';

import { PagoService } from '../../providers/pago.service';
import { DatabaseService } from '../../providers/database.service';
import { StorageService } from '../../providers/storage.service';
import { ApiService } from '../../providers/api.service';
import { AuthService } from '../../providers/auth.service';  
import { EventsService } from '../../providers/events.service';

import { Device } from '@ionic-native/device/ngx';

import { FormControl, FormGroup, Validators} from "@angular/forms";
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';

import { CountrySelectPage } from '../../modals/country-select/country-select.page';

@Component({
  selector: 'app-appointment-checkout',
  templateUrl: './appointment-checkout.page.html',
  styleUrls: ['./appointment-checkout.page.scss'],
})
export class AppointmentCheckoutPage implements OnInit {
  loading: any;

  form: FormGroup;

  price: string = "0";

  final_data: any = {
    precio_extranjero: 0,
    precio_nacional: 0,
    nombre: '',
    fecha: '',
    medico_id: '',
    id_con: '',
    hor_con: ''
  };

  first_pay: boolean = true;
  nationality: string = "";

  check_1: boolean = false;
  check_2: boolean = false;
  i18n: any; 

  pago_subscribe: any;
  constructor(public navCtrl: NavController,
              private route: ActivatedRoute,
              private events: EventsService,
              private database: DatabaseService,
              private storage: StorageService,
              private alertCtrl: AlertController,
              public loadingCtrl: LoadingController,
              private translateService: TranslateService,
              private api: ApiService,
              public modalController: ModalController,
              private device: Device,
              private auth: AuthService,
              private pago: PagoService) {
  }

  ngOnInit () {
    let name;
    let phone_number;

    if (this.auth.user.first_name === '') {
      name = null;
    } else {
      name = this.auth.user.first_name + ' ' + this.auth.user.last_name;
    }

    if (this.auth.user.country_dial_code === '' || this.auth.user.phone_number === '') {
      phone_number = null;
    } else {
      phone_number = this.auth.user.country_dial_code + ' ' + this.auth.user.phone_number
    }

    this.form = new FormGroup ({
      name: new FormControl (name, Validators.required),
      phone_number: new FormControl (phone_number, Validators.required),
      nationality: new FormControl (null, Validators.required),
      email: new FormControl (this.auth.user.email, Validators.required),
      message: new FormControl (null),
      terms_conditions: new FormControl (false, Validators.compose([
        Validators.required,
        Validators.pattern('true')
      ]))
    });

    this.final_data.fecha = this.route.snapshot.paramMap.get ("fecha");
    this.final_data.nombre = this.route.snapshot.paramMap.get ("nombre");
    this.final_data.precio_nacional = this.route.snapshot.paramMap.get ("precio_nacional");
    this.final_data.precio_extranjero = this.route.snapshot.paramMap.get ("precio_extranjero");
    this.final_data.medico_id = this.route.snapshot.paramMap.get ("medico_id");
    this.final_data.id_con = this.route.snapshot.paramMap.get ("id_con");
    this.final_data.hor_con = this.route.snapshot.paramMap.get ("hor_con");
    
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

        this.onSelectChange ('peruano');



        this.pago_subscribe = this.events.getObservable ().subscribe (async (token) => {
          const loading = await this.loadingCtrl.create ({
            message: "Procesando informacion de pago..."
          });

          loading.present ();

          const value = this.form.value;

          let data: any = {
            token: token,
            monto: parseInt(this.price) * 100,
            correo: value.email,
            moneda: 'PEN',
            des: "Pago de consulta medica - " + this.final_data.nombre,
            consulta: this.final_data.id_con,
            doctor: this.final_data.medico_id
          };

          this.api.procesarPago (data).subscribe ((response: any) => {
            if (response.estado === 1 && response.libre === 1 && response.respuesta.outcome.type === 'venta_exitosa') {
              const data_cita: any = {
                key: '',
                cliente_nombre: value.name,
                phone_number: value.phone_number,
                nationality: value.nationality,
                email: value.email,
                message: value.message,
                price: this.price,
                specialty_name: this.final_data.nombre,
                date: this.final_data.fecha,
                hour: this.final_data.hor_con
              };

              let uid = "";
              if (this.auth.is_logged) {
                uid = this.auth.user.id;
              } else {
                uid = this.device.uuid
              }

              this.database.addAppointment (uid, data_cita).then (resonse_key => {
                const key = resonse_key;

                const data: any = {
                  consulta: this.final_data.id_con,
                  nacionalidad: value.nationality,
                  email: value.email,
                  message: value.message,
                  id_tra: response.respuesta.id,
                  phone: value.phone_number,
                  name: value.name,
                  especialidad: this.final_data.nombre,
                  idioma: 'es'
                };

                this.api.checkoutapp (data).subscribe (async (response_checkout: any) => {
                  loading.dismiss ();

                  if (response_checkout.estado === 1) {
                    if (this.auth.is_logged) {
                      this.navCtrl.navigateRoot (['appointment-detail', JSON.stringify ({ data: resonse_key })]);
                    } else {
                      loading.dismiss ();
                      this.navCtrl.navigateRoot (['appointment-detail', JSON.stringify (data_cita)]);
                    }
                  } else {
                    loading.dismiss ();

                    const alert = await this.alertCtrl.create({
                      header: '!Error con la reserva!',
                      subHeader: 'La cita fue pagada, pero por algun error no se pudo almacenar en la base de datos',
                      buttons: ['OK']
                    });
                    
                    alert.present();
                  }
                }, async error => {
                  loading.dismiss ();

                  const alert = await this.alertCtrl.create({
                    header: 'Error con la reserva!',
                    subHeader: 'La cita fue pagada, pero por algun error no se pudo almacenar en la base de datos',
                    buttons: ['OK']
                  });
                    
                  alert.present();
                });
              });
            }
          }, async error => {
            loading.dismiss ();
              
            const alert = await this.alertCtrl.create({
              header: 'Error!',
              subHeader: 'Ocurrio un error en la reserva',
              buttons: ['OK']
            });

            alert.present();
          });
        });
      });
    });
  }

  ngOnDestroy () {
    this.pago_subscribe.unsubscribe ();
  }

  onSelectChange (event: any) {
    if (event === "peruano") {
      
    } else {
      this.price = this.final_data.precio_extranjero;
    }
  }

  goHome () {
    this.navCtrl.navigateRoot ('home');
  }

  async openCheckout () {
    this.loading = await this.loadingCtrl.create({
      message: "Procesando informacion...",
    });

    this.loading.present ();
    
    this.pago.cfgFormulario ("Pago por servicio", parseInt(this.price) * 100); // 300.000
                                                            // 9.99
    // Cuando la configuracion termina, llamo al metodo open () para abrir el formulario 
    this.loading.dismiss ().then (() => {
      this.pago.open ();
    });
  }

  async selectCountry () {
    const modal = await this.modalController.create({
      component: CountrySelectPage
    });

    modal.onDidDismiss ().then ((response: any) => {
      if (response.role === 'ok') {
        this.nationality = response.data.name;
        this.form.controls ['nationality'].setValue (response.data.name);

        this.check_1 = true;
        if (response.data.code === 'PE') {
          this.check_2 = true;
          this.price = this.final_data.precio_nacional;
        } else {
          this.check_2 = false;
          this.price = this.final_data.precio_extranjero;
        }
      }
    });

    return await modal.present();
  }

  getFormatDate (fecha: string, hor_con: string) {
    return moment(fecha + ' ' + hor_con).format('LLLL');
  }
}
