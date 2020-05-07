import { Component, OnInit } from '@angular/core';
import { Platform, NavController, LoadingController, AlertController } from '@ionic/angular';

import { FormControl, FormGroup, Validators} from "@angular/forms";
import { StorageService } from '../../providers/storage.service';
import { DatabaseService } from '../../providers/database.service';
import { AuthService } from '../../providers/auth.service';
import { TranslateService } from '@ngx-translate/core';

import { first, map } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loading: any;
  form: FormGroup;
  i18n: any;
  constructor(public navCtrl: NavController, 
              private alertCtrl: AlertController,
              private translateService: TranslateService,
              private storage: StorageService,
              private loadingCtrl: LoadingController,
              private database: DatabaseService,
              public platform: Platform,
              private auth: AuthService) {
  }

  ngOnInit () {
    this.form = new FormGroup ({
      email: new FormControl ('', Validators.required),
      password: new FormControl ('', Validators.required),
    });

    this.storage.getValue ('i18n').then (i18n => {
      this.translateService.getTranslation (i18n).subscribe ((i18n: any) => {
        this.i18n = i18n;
      });
    });
  }

  InitMap () {
  }

  async onSubmit () {
    this.loading = await this.loadingCtrl.create({
      message: this.i18n.procesando_informacion,
    });

    this.loading.present ();

    const value = this.form.value;

    this.auth.loginEmailPassword (value.email.toLowerCase(), value.password)
      .then ((user: any) => {
        console.log ("User", user);

        this.database.isUser (user.user.uid).pipe (first ()).toPromise ().then (async (data: any) => {
          if (data.disabled) {
            const alert = await this.alertCtrl.create({
              header: 'Usuario bloqueado',
              subHeader: 'Su usuario ha sido bloqueado, contacte al administrador',
              buttons: ['OK']
            });

            await alert.present();
  
            this.auth.signOut ();
          }

          this.loading.dismiss ();
        });
        this.navCtrl.navigateRoot ("home");
      }, (error: any) => {
        this.loading.dismiss ()
         .then(async () => {
            let mensajeError: string = "";

            if (error.code == "auth/network-request-failed") {
              mensajeError = "No tienes acceso a internet, no se puede proceder."
            } else if (error.code == "auth/user-not-found") {
              mensajeError = "No encontramos a nigun usuario con ese correo";
            } else if (error.code == "auth/wrong-password") {
              mensajeError = "Ingrese una contraseña valida";
            } else if (error.code == "auth/too-many-requests") {
              mensajeError = "Hemos bloqueado todas las solicitudes de este dispositivo debido a una actividad inusual. Inténtalo más tarde.";
            } else {
              mensajeError = error.message;
            }
            
            console.log (mensajeError);

            let alert = await this.alertCtrl.create({
              header:"¡Opppps!",
              message: mensajeError,
              mode: 'md',
              buttons: [
                {
                  text: this.i18n.OK,
                  role: "cancel"
                }
              ]
            });

            await alert.present ();
        });
    });
  }

  goHome () {
    this.navCtrl.navigateRoot ("home");  
  }

  goRegistry () {
    this.navCtrl.navigateForward ("registry");
  }

  google () {
    this.auth.googleLogin ();
  }

  facebook () {
    this.auth.facebookLogin ();
  }

  async resetPassword () {
    let alert = await this.alertCtrl.create({
      header: '¿Olvidaste tu contraseña?',
      message: 'Ingresa tu correo electronico y te enviaremos un correo indicandote los pasos para poder recuperarla.',
      inputs: [
        {
          name: 'email',
          placeholder: 'Correo electronico',
          type: 'email'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, 
        {
          text: 'Enviar',
          handler: async (data) => {
            let loading = await this.loadingCtrl.create({
              message: this.i18n.procesando_informacion
            });

            await loading.present ();

            this.auth.sendPasswordResetEmail (data.email)
              .then (async (response: any) => {
                loading.dismiss ();

                let alert = await this.alertCtrl.create({
                  header: 'Usuario encontrado',
                  message: 'Acabamos de enviar un email a <strong>' + data.email + '</strong>, incluyendo los pasos para resetear la contraseña',
                  buttons: ['OK']
                });

                await alert.present ();   
              }, async (error: any) => {
                loading.dismiss ();

                let message: string = "";

                if (error.code == 'auth/network-request-failed') {
                  message = 'No tienes acceso a internet, no se puede proceder.'
                } else if (error.code == 'auth/user-not-found') {
                  message = 'No encontramos a nigun usuario con ese correo';
                } else {
                  message = error.message;
                }

                let alert = await this.alertCtrl.create({
                  header: 'Opppps!',
                  message: message,
                  buttons: ['OK']
                });

                await alert.present();
              });
          }
        }
      ]
    });

    alert.present();
  }

  apple () {
    this.auth.appleLogin ();
  }
}
