import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
 
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { DatabaseService } from '../../providers/database.service';
import { ApiService } from '../../providers/api.service';
import { StorageService } from '../../providers/storage.service';

import { LoadingController, NavController, ModalController, AlertController, IonContent } from '@ionic/angular';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-appointment-date',
  templateUrl: './appointment-date.page.html',
  styleUrls: ['./appointment-date.page.scss'],
})
export class AppointmentDatePage implements OnInit {
  @ViewChild(IonContent, { static: false }) content: IonContent;

  date: any;
  daysInThisMonth: any;
  daysInLastMonth: any;
  daysInNextMonth: any;
  monthNames: string[];
  currentMonth: any;
  currentYear: any;
  currentDate: any;
  eventList: any;
  selectedEvent: any;
  isSelected: any;

  final_date_format: string;

  enabled_days = [];
  citas: any [] = [];
  horas: any [] = [];

  final_data: any = {
    precio_extranjero: 0,
    precio_nacional: 0,
    nombre: '',
    nombre_referencia: '',
    fecha: '',
    medico_id: '',
    id_con: '',
    hor_con: ''
  };

  check_1: boolean = false;
  check_2: boolean = false;

  especialidad_name: string = "";

  i18n: any;
  constructor(public navCtrl: NavController,
      private route: ActivatedRoute, 
      private loadingCtrl: LoadingController,
      private database: DatabaseService,
      private api: ApiService,
      private storage: StorageService,
      private alertCtrl: AlertController,
      private translateService: TranslateService,
      public modalController: ModalController) {}
      ngOnInit () {
        this.storage.getValue ('i18n').then (async i18n => {
          this.translateService.getTranslation (i18n).subscribe (async (i18n: any) => {
            this.i18n = i18n;
            
            this.final_data.precio_extranjero = this.route.snapshot.paramMap.get ('precio_extranjero');
            this.final_data.precio_nacional = this.route.snapshot.paramMap.get ('precio_nacional');
            this.final_data.nombre = this.route.snapshot.paramMap.get ('nombre');
            this.final_data.nombre_referencia = this.route.snapshot.paramMap.get ('nombre_referencia');
            this.final_data.descripcion = this.route.snapshot.paramMap.get ('descripcion');

            this.date = new Date();
            this.monthNames = [this.i18n.enero, this.i18n.febrero, this.i18n.marzo,
                               this.i18n.abril, this.i18n.mayo, this.i18n.junio,
                               this.i18n.julio, this.i18n.agosto, this.i18n.septiembre,
                               this.i18n.octubre, this.i18n.noviembre, this.i18n.diciembre];
            this.getDaysOfMonth();
    
            const loading = await this.loadingCtrl.create ({
              message: this.i18n.procesando_informacion, 
            });
    
            loading.present ().then (() => {
              this.api.getCitasEspecialidad (this.final_data.nombre_referencia.toLowerCase ())
              .timeout(60 * 1000)
              .subscribe (data => {
                this.citas = data;
                this.enabled_days = [];
    
                for (let cita of data) {
                  let date = new Date (cita.fec_cit);
                  date.setDate (date.getDate() + 1);
                  this.enabled_days.push (date);
                }
    
                this.getDaysOfMonth ();
                loading.dismiss ();
              }, async error => {
                loading.dismiss ();
                this.navCtrl.pop ();
    
                let alert = await this.alertCtrl.create({
                  header: this.i18n.server_error,
                  message: this.i18n.try_again,
                  buttons: [
                    {
                      text: this.i18n.CANCEL,
                      role: 'cancel',
                      handler: () => {

                      }
                    },
                    {
                      text: this.i18n.OK,
                      handler: () => {

                      }
                    }
                  ]
                });

                alert.present();
              });
            });
          });
        });
      }
      
      goHome () {
        this.navCtrl.navigateRoot ('home');  
      }
    
      is_enable_day (day: number) {
        let month = this.date.getMonth ();
        let year = this.date.getFullYear ();
    
        let dinamic_date = new Date(year, month, day);
        
        for (let date of this.enabled_days) {
          if (date.getDate() === dinamic_date.getDate()) {
            if (date.getMonth () === dinamic_date.getMonth()) {
              return true;
            }
          }
        }
        
        return false;  
      }
    
      getDaysOfMonth () {
        this.daysInThisMonth = new Array();
        this.daysInLastMonth = new Array();
        this.daysInNextMonth = new Array();
        this.currentMonth = this.monthNames[this.date.getMonth()];
        this.currentYear = this.date.getFullYear();
        if(this.date.getMonth() === new Date().getMonth()) {
          this.currentDate = new Date().getDate();
        } else {
          this.currentDate = 999;
        }
    
        var firstDayThisMonth = new Date(this.date.getFullYear(), this.date.getMonth(), 1).getDay();
        var prevNumOfDays = new Date(this.date.getFullYear(), this.date.getMonth(), 0).getDate();
        for(var i = prevNumOfDays-(firstDayThisMonth-1); i <= prevNumOfDays; i++) {
          this.daysInLastMonth.push(i);
        }
    
        var thisNumOfDays = new Date(this.date.getFullYear(), this.date.getMonth()+1, 0).getDate();
        for (var j = 0; j < thisNumOfDays; j++) {
          this.daysInThisMonth.push(j+1);
        }
    
        var lastDayThisMonth = new Date(this.date.getFullYear(), this.date.getMonth()+1, 0).getDay();
        for (var k = 0; k < (6 - lastDayThisMonth); k++) {
          this.daysInNextMonth.push(k+1);
        }
    
        var totalDays = this.daysInLastMonth.length+this.daysInThisMonth.length+this.daysInNextMonth.length;
        if(totalDays < 36) {
          for(var l = (7-lastDayThisMonth); l < ((7-lastDayThisMonth)+7); l++) {
            this.daysInNextMonth.push (l) ;
          }
        }
      }
    
      goToLastMonth () {
        this.date = new Date(this.date.getFullYear(), this.date.getMonth(), 0);
        this.getDaysOfMonth ();
        this.clear_all_days ();
      }
    
      goToNextMonth () {
        this.date = new Date(this.date.getFullYear(), this.date.getMonth()+2, 0);
        this.getDaysOfMonth ();
        this.clear_all_days ();
      }
    
      async selectDate(day: number, id: any) {
        let month = this.date.getMonth ();
        let year = this.date.getFullYear ();
    
        let dinamic_date = new Date (year, month, day);
    
        for (let date of this.enabled_days) {
          if (date.getDate () === dinamic_date.getDate ()) {
            if (date.getMonth () === dinamic_date.getMonth ()) {
              const loading = await this.loadingCtrl.create ({
                message: this.i18n.procesando_informacion,
              });
        
              loading.present ().then (() => {
                this.clear_all_days ();
                
                let elem = document.getElementById ('calendar-' + day.toString ());
                elem.setAttribute("style", "border: 3px solid #230084; border-radius: 12px; color: #fff !important;");
    
                let _month = "";
                let _day = day.toString();
    
                if ((month + 1) < 10) {
                  _month = "0" + (month + 1).toString();
                } else {
                  _month = (month + 1).toString();
                }
    
                if (_day.length <= 1) {
                  _day = "0" + day.toString();
                }
    
                this.final_data.fecha = year.toString() + "-" + _month + "-" + _day;
                for (let cita of this.citas) {
                  if (cita.fec_cit === this.final_data.fecha) {
                    this.final_data.medico_id = cita.med_esp;
                  }
                } 
                
                this.api.getHorariosFecha (this.final_data.medico_id, this.final_data.fecha).subscribe ((data: any []) => {
                  console.log (data);

                  loading.dismiss ();              
                  this.check_1 = true;
                  this.horas = data.filter ((hora: any) => {
                    let returned: boolean = true;
                    let fecha = moment (hora.fec_cit + ' ' + hora.hor_con);
                    let moment_now = moment ();

                    if (fecha.isSame (moment_now, 'day')) {
                      let hh_now = parseInt (moment ().format ('HH'));
                      let mm_now = parseInt (moment ().format ('mm'));
                      let ss_now = parseInt (moment ().format ('ss'));

                      let hh = parseInt (hora.hor_con.split (':') [0]);
                      let mm = parseInt (hora.hor_con.split (':') [1]);
                      let ss = parseInt (hora.hor_con.split (':') [2]);

                      if (hh_now > hh) {
                        returned = false;
                      } else {
                        if (mm_now > mm) {
                          returned = false;
                        } else {
                          if (ss_now > ss) {
                            returned = false;
                          }
                        }
                      }
                    }

                    return returned;
                  });

                  setTimeout (() => {
                    this.content.scrollToBottom (210);
                  }, 500);
                });
              });
            }
          }
        }
      }
    
      clear_all_days () {
        for (let day of this.daysInThisMonth) {
          try {
            let elem = document.getElementById ('calendar-' + day);
            elem.setAttribute("style", "background-color: #fff;");
          } catch (error) {
            console.log (error);
          }
        }
      }
    
      isMorning (time: string): boolean {
        var hour = time.substring (0, 2);
        var _hour = parseInt (hour);
    
        if (_hour >= 0 && _hour < 13) {
          return true;
        }
        
        return false;
      }
    
      isAfternoon (time: string): boolean {
        var hour = time.substring (0, 2);
        var _hour = parseInt (hour);
    
        if (_hour >= 12 && _hour < 18) {
          return true;
        }
    
        return false;
      }
    
      isEvening (time: string): boolean {
        var hour = time.substring (0, 2);
        var _hour = parseInt (hour);
    
        if (_hour >= 18 && _hour < 23) {
          return true;
        }
        
        return false;
      }
    
      selectHour (hour: any) {
        this.check_2 = true;
    
        this.final_data.id_con = hour.id_con;
        this.final_data.hor_con = hour.hor_con;
        this.final_date_format = moment (this.final_data.fecha + ' ' + hour.hor_con).format('LL');
      
        this.clearHour (hour.id_con);
    
        this.goNext ();
      }
    
      clearHour (id) {
        try {
          let elem_selected = document.getElementById ('h-' + id);
          elem_selected.setAttribute("style", "background-color: #230084; color: #ffffff;");
           
          for (let item of this.horas) {        
            try {
              if (item.id_con !== id) {
                let elem = document.getElementById ('h-' + item.id_con);
                elem.setAttribute("style", "background-color: #fff; color: #333;");
              }
            } catch (error) {
              console.log (error);
            }
          }
        } catch (error) {
          console.log (error);
        }
      }
    
      goNext () {
        this.navCtrl.navigateForward (['appointment-checkout', this.final_data.fecha, 
          this.final_data.nombre, this.final_data.precio_nacional, this.final_data.precio_extranjero, 
          this.final_data.medico_id, this.final_data.id_con, this.final_data.hor_con]);
      }
    
      goEmergency () {
        this.navCtrl.navigateForward ("emergency");
      }
}
