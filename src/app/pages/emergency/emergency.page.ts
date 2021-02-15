import { Component, OnInit } from '@angular/core';

import { NavController, Platform, AlertController, LoadingController } from '@ionic/angular';

import { AppAvailability } from '@ionic-native/app-availability/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { FormControl, FormGroup, Validators} from "@angular/forms";

import { ApiService } from '../../providers/api.service';
import { AuthService } from '../../providers/auth.service';

// Translate Service
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../../providers/storage.service';

// SMS
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@Component({
  selector: 'app-emergency',
  templateUrl: './emergency.page.html',
  styleUrls: ['./emergency.page.scss'],
})
export class EmergencyPage implements OnInit {
  loading: any;
  form: FormGroup;  
  i18n: any;
  constructor(public navCtrl: NavController, 
              private appAvailability: AppAvailability,
              private platform: Platform,
              private storage: StorageService,
              private translateService: TranslateService,
              private loadingCtrl: LoadingController,
              public alertCtrl: AlertController,
              private callNumber: CallNumber,
              public api: ApiService,
              private sharing: SocialSharing,
              private auth: AuthService
              ) {
  }

  ngOnInit () {
    let fullname = '';
    let email = '';
    let telefono = '';
    

    if (this.auth.user.first_name !== null && this.auth.user.first_name !== undefined) {
      fullname = this.auth.user.first_name;
    }

    if (this.auth.user.last_name !== null && this.auth.user.last_name !== undefined) {
      fullname += ' ' + this.auth.user.last_name;
    }

    if (this.auth.user.phone_number !== null && this.auth.user.phone_number !== undefined) {
      telefono = this.auth.user.phone_number;
    }

    if (this.auth.user.email !== null && this.auth.user.email !== undefined) {
      email = this.auth.user.email;
    }

    this.form = new FormGroup ({
      fullname: new FormControl (fullname, Validators.required),
      email: new FormControl (email, [Validators.required, Validators.email]),
      phone_number: new FormControl (telefono, [Validators.required, 
                                          Validators.minLength (9), 
                                          Validators.maxLength (9)]),
      message: new FormControl ('', Validators.required)
    });

    this.storage.getValue ('i18n').then (i18n => {
      this.translateService.getTranslation (i18n).subscribe ((i18n: any) => {
        this.i18n = i18n;
      });
    });
  }

  ngOnDestroy () {

  }

  goSendAmbulance () {
    this.navCtrl.navigateForward ("send-ambulance");
  }

  goHome () {
    // this.navCtrl.setRoot ("HomePage", {}, {animate: true, direction: "back"});  
  }

  async submit () {
    let loading = await this.loadingCtrl.create({
      message: this.i18n.procesando_informacion,
    });

    loading.present ();

    const value = this.form.value;

    let data: any = {
      idioma: this.translateService.getDefaultLang (),
      nombres: value.fullname,
      email: value.email,
      telefono: value.phone_number,
      mensaje:value.message
    }

    this.api.sendMessage (data).subscribe (async (response: any) => {
      if (response.estado === 1) {
        const alert = await this.alertCtrl.create({
          header: this.i18n.mensaje_exitoso, // Mensaje exitoso
          subHeader: response.mensaje + '.',
          buttons: ['OK']
        });

        await alert.present();

        this.form.controls ['fullname'].setValue ('');
        this.form.controls ['email'].setValue ('');
        this.form.controls ['phone_number'].setValue ('');
        this.form.controls ['message'].setValue ('');
      } else {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          subHeader: response.mensaje,
          buttons: ['OK']
        });

        await alert.present ();
      }

      loading.dismiss ();
    }, error => {
      loading.dismiss ();
      console.log (error)
    });
  }

  async callNow () {
    const loading = await this.loadingCtrl.create({
      message: this.i18n.procesando_informacion
    });

    await loading.present ();
    
    this.callNumber.callNumber("+51989316622", true)
    .then(res => {
      loading.dismiss ();
    })
    .catch(err => {
      loading.dismiss ();
    });
  }

  async sendSMS () {
    let message: string = '';
    const loading = await this.loadingCtrl.create({
      message: this.i18n.procesando_informacion
    });

    await loading.present ();

    this.storage.getValue ("i18n").then (lang => {
      this.sharing.shareViaSMS ('', '+51989316622')
        .then (res => {
          loading.dismiss ();
        })
        .catch (err => {
          loading.dismiss ();
        });
    });
  }

  chatWhatsapp () {
    this.sharing.shareViaWhatsAppToReceiver ('+51989316622', '')
      .then (() => {
          
      })
      .catch (async (error: any) => {
        console.log (error);

        const alert = await this.alertCtrl.create({
          message: this.i18n.instale_whatsApp_messenger,
          buttons: ['OK']
        });
    
        await alert.present ();
      });
  }

  async chatMessenger () {
    const loading = await this.loadingCtrl.create({
      message: this.i18n.procesando_informacion
    });

    await loading.present ();

    let app;

    if (this.platform.is ('ios')) {
      app = 'messenger://';
    } else if (this.platform.is ('android')) {
      app = 'com.facebook.orca';
    }

    this.appAvailability.check (app).then (
      (yes: boolean) => {
        loading.dismiss ();
        location.href = "https://www.messenger.com/t/clinica.peruanosuiza";
      },
      async (no: boolean) => {
        loading.dismiss ();

        const alert = await this.alertCtrl.create({
          message: this.i18n.instale_facebook_messenger,
          buttons: ['OK']
        });

        await alert.present();
      }
    );
  }
}
