import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ModalController, AlertController } from '@ionic/angular';

import { FormControl, FormGroup, Validators} from "@angular/forms";
import { CustomValidators, CustomFormsModule } from 'ng2-validation';

import { AuthService } from '../../providers/auth.service';
import { DatabaseService } from '../../providers/database.service';
import { ApiService } from '../../providers/api.service';
import { StorageService } from '../../providers/storage.service';
// Translate Service
import { TranslateService } from '@ngx-translate/core'; 
import { PaisesCodsPage } from '../../modals/paises-cods/paises-cods.page';
@Component({
  selector: 'app-registry',
  templateUrl: './registry.page.html',
  styleUrls: ['./registry.page.scss'],
})
export class RegistryPage implements OnInit {
  form: FormGroup;
  loading: any;

  pais_selected: any = {
    name: "Peru",
    dial_code: "+51",
    code: "PE"
  };
  i18n: any;
  constructor(public navCtrl: NavController, 
              private api: ApiService,
              private translateService: TranslateService,
              private auth: AuthService,
              private database: DatabaseService,
              public modalController: ModalController,
              private storage: StorageService,
              private alertCtrl: AlertController,
              private loadingCtrl: LoadingController) {
  }

  ngOnInit () {
    let password = new FormControl ('', Validators.required);
    let confirm_password = new FormControl ('', [Validators.required, CustomValidators.equalTo(password)]);

    this.form = new FormGroup ({
      first_name: new FormControl ('', Validators.required),
      last_name: new FormControl ('', Validators.required),
      phone_number: new FormControl ('', [Validators.required, Validators.minLength (9)]),
      email: new FormControl ('', [Validators.required, Validators.email]),
      password: password,
      confirm_password: confirm_password      
    });

    this.storage.getValue ('i18n').then (i18n => {
      this.translateService.getTranslation (i18n).subscribe ((i18n: any) => {
        this.i18n = i18n;
      });
    });
  }

  InitMap () {
  }

  goHome () {
    this.navCtrl.navigateRoot ("home");  
  }

  async onSubmit () {
    this.loading = await this.loadingCtrl.create({
      message: this.i18n.procesando_informacion
    });

    await this.loading.present ();

    const value = this.form.value;

    let data: any = {
      id: '',
      first_name: value.first_name,
      last_name: value.last_name,
      email: value.email,
      phone_number: value.phone_number,
      type: 'user',
      is_free: false,
      country_name: this.pais_selected.name,
      country_dial_code: this.pais_selected.dial_code,
      country_code: this.pais_selected.code,
      disabled: false
    }

    this.auth.addUser (value.email, value.password)
      .then ((response) => {
        data.id = response.user.uid;
      
        this.database.addUser (response.user.uid, data).then ((response) => {
          this.navCtrl.navigateRoot ("home");
          this.loading.dismiss ();

          this.api.enviarcorreologinapp (this.translateService.getDefaultLang (),
                                         data.first_name + ' ' + data.last_name,
                                         data.email)
            .subscribe (response => {
              console.log ('Mensaje', response)
            }, error => {
              console.log ('Error', error);
            });
        });
      }, async (error: any) => {
        this.loading.dismiss (); 
        
        let message;

        if (error.code == "auth/email-already-in-use") {
          message = "Esta dirección de correo electrónico ya está siendo utilizada por otra persona."
        } else if (error.code == "auth/network-request-failed") {
          message = "No tienes acceso a internet, no se puede proceder."
        } else {
          message = error.message;
        }

        let alert = await this.alertCtrl.create({
          header: '¡Opppps!',
          message: message,
          buttons: ['Ok']
        });

        await alert.present();
      });
  }

  getFlat () {
    return "https://www.countryflags.io/" + this.pais_selected.code + "/flat/24.png";
  }

  async select_code () {
    const modal = await this.modalController.create({
      component: PaisesCodsPage,
    });

    modal.onDidDismiss ().then ((response: any) => {
      if (response.role === 'ok') {
        this.pais_selected = response.data;
        this.getFlat ();
      }
    });

    return await modal.present ();
  }
}
