import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ModalController } from '@ionic/angular';
 
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { DatabaseService } from '../../providers/database.service';
import { ApiService } from '../../providers/api.service';

// import { Events } from 'ionic-angular';

import 'rxjs/add/operator/timeout'; 

// Translate Service
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../../providers/storage.service';

@Component({
  selector: 'app-appointment-specialty',
  templateUrl: './appointment-specialty.page.html',
  styleUrls: ['./appointment-specialty.page.scss'],
})
export class AppointmentSpecialtyPage implements OnInit {
  url_imagenes: string;
	especialidades: any [];
  servicios: any [];
  sintomas: any = [];
  
  is_services_loading: boolean = false;
  is_sintomas_loading: boolean = false;

  final_data: any = {
    precio_extranjero: 0,
    precio_nacional: 0,
    nombre: '',
    nombre_referencia: '',
    descripcion: '',
    fecha: '',
    medico_id: '',
    id_con: '',
    hor_con: ''
  };

  type: string = 'specialties';
  lang: string;
  text_changed: string = "";
  is_specialties: boolean = true;
  i18n: any;

  unsubscribe_01: any;
  unsubscribe_02: any;
  unsubscribe_03: any;
  constructor(public navCtrl: NavController, 
              private database: DatabaseService,
              public modalCtrl: ModalController,
              // private events: Events,
              private translateService: TranslateService,
              public loadingCtrl: LoadingController,
              private http: HttpClient,
              private storage: StorageService,
              private api: ApiService) {
  }

  ngOnInit () {
    this.url_imagenes = "https://preview.cps.com.pe/";

    this.load ();

    this.is_services_loading = false;
    this.is_sintomas_loading = false;

    // this.events.subscribe('i18n_changed', async (lang: string) => {
    //   this.lang = lang;
      
    //   this.translateService.getTranslation (lang).subscribe ((i18n: any) => {
    //     this.i18n = i18n;
    //     this.text_changed = i18n.View_by_symptoms;
    //   });
      
    //   const loading = this.loadingCtrl.create ({
    //     message: this.i18n.procesando_informacion
    //   });

    //   loading.present ();
      
    //   this.unsubscribe_01 = await this.api.getEspecialidades (this.lang).timeout(1000 * 60).subscribe (data => {
    //     this.especialidades = data;

    //     console.log (data);
    //   }, error => {
    //     console.log ('error', error);
    //   });

    //   this.unsubscribe_02 = await this.api.getServices (this.lang).timeout(1000 * 60).subscribe (data => {
    //     this.servicios = data;
    //     this.is_services_loading = true;
    //     console.log (data);
    //   }, error => {
    //     console.log (error);
    //   });

    //   this.unsubscribe_03 = await this.api.getsintomas (this.lang).timeout(1000 * 60).subscribe (data => {
    //     this.sintomas = data;
    //     this.is_sintomas_loading = true;
    //     console.log (data);
        
    //   }, error => {
    //     console.log (error);
    //   });

    //   await loading.dismiss ();
    // });
  }

  async load () {
    this.storage.getValue ('i18n').then (lang => {
      console.log ("i18n", lang);

      this.translateService.getTranslation (lang).subscribe (async (i18n: any) => {
        this.i18n = i18n;
        this.text_changed = i18n.View_by_symptoms;

        const loading = await this.loadingCtrl.create ({
          message: this.i18n.procesando_informacion
        });

        loading.present ();

        this.lang = lang;

        console.log (this.lang)

        this.unsubscribe_01 = this.api.getEspecialidades (this.lang).timeout(1000 * 60).subscribe (data => {
          this.especialidades = data;

          console.log (data);
          loading.dismiss ();
        }, error => {
          console.log ('error', error);
          loading.dismiss ();
        });
      });
    });
  }

  ionViewWillLeave () {
    // this.events.unsubscribe('i18n_changed', null);

    if (this.unsubscribe_01 != undefined && this.unsubscribe_01 != null) {
      this.unsubscribe_01.unsubscribe ();
    }

    if (this.unsubscribe_02 != undefined && this.unsubscribe_02 != null) {
      this.unsubscribe_02.unsubscribe ();
    }

    if (this.unsubscribe_03 != undefined && this.unsubscribe_03 != null) {
      this.unsubscribe_03.unsubscribe ();
    }
  }

  goHome () {
    this.navCtrl.navigateRoot ('home');
  }

  select (item: any) {
    console.log (item);

    if (item.tiene_variaciones === '0' || item.tiene_variaciones === undefined || item.tiene_variaciones === null) {
      //this.clear_buttons (item.id);

      this.final_data.precio_extranjero = item.precio_extranjero;
      this.final_data.precio_nacional = item.precio_nacional;
      this.final_data.nombre = item.nombre;
      this.final_data.nombre_referencia = item.nombre_referencia;
      this.final_data.descripcion = item.descripcion;

      this.navCtrl.navigateForward (['appointment-date', item.precio_extranjero, item.precio_nacional,
      item.nombre, item.nombre_referencia, item.descripcion]);
      // this.navCtrl.push ("AppointmentDatePage", this.final_data);
    } else {
      // let myModal = this.modalCtrl.create("SubcategoriasPage", {
      //   id: item.esp_id,
      //   lang: this.lang
      // });

      // myModal.onDidDismiss((response: any) => {
      //   if (response) {
      //     this.final_data.precio_extranjero = response.precio_extranjero;
      //     this.final_data.precio_nacional = response.precio_nacional;
      //     this.final_data.nombre = response.nombre_referencia;
      //     this.final_data.descripcion = response.descripcion;

      //     this.navCtrl.push ("AppointmentDatePage", this.final_data);
      //   }
      // });

      // myModal.present();
    }
  }

  clear_buttons (id: string) {
    try {
      let elem = document.getElementById ('es-' + id);
      elem.setAttribute("style", "border: 6px solid #230084;");

      let elem_2 = document.getElementById ('se-' + id);
      elem_2.setAttribute("style", "border: 6px solid #230084;");
     
      for (let item of this.especialidades) {  
        try {
          if (item.id !== id) {
            let elem = document.getElementById ('es-' + item.id);
            elem.setAttribute("style", "border: 0px solid #fff;");

            let elem_2 = document.getElementById ('se-' + item.id);
            elem_2.setAttribute("style", "border: 0px solid #fff;");
          }
        } catch (error) {
          console.log (error);
        }
      }
    } catch (error) {
      console.log (error);
    }
  }

  async segmentChanged (event: any) {
    console.log (event);
    if (event.value === 'services') {
      if (this.is_services_loading === false) {
        const loading = await this.loadingCtrl.create ({
          message: this.i18n.procesando_informacion
        });

        loading.present ();

        this.unsubscribe_02 = this.api.getServices (this.lang).timeout(1000 * 60).subscribe (data => {
          this.servicios = data;
          this.is_services_loading = true;
          console.log (data);
          loading.dismiss ();
        }, error => {
          //loading.dismiss();
          console.log (error);
          //this.navCtrl.pop ();
        });
      }
    }
  }

  async changeEs () {
    if (this.is_specialties) {
      this.text_changed = this.i18n.View_by_speciality;
      this.is_specialties = false;

      if (this.is_sintomas_loading === false) {
        const loading = await this.loadingCtrl.create ({
          message: this.i18n.procesando_informacion
        });

        loading.present ();
        
        this.unsubscribe_03 = this.api.getsintomas (this.lang).timeout(1000 * 60).subscribe (data => {
          this.sintomas = data;
          this.is_sintomas_loading = true;
          console.log (data);
          loading.dismiss ();
        }, error => {
          //loading.dismiss();
          console.log (error);
          //this.navCtrl.pop ();
        });
      }
    } else {
      this.is_specialties = true;
      this.text_changed = this.i18n.View_by_symptoms;
    }
  }

  getImage (url: string) {
    //console.log ('this.url_imagenes + url', this.url_imagenes + url);
    return this.url_imagenes + url;
  }
}
