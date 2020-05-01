import { Component, ɵConsole } from '@angular/core';

import { Platform, NavController, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

// Services
import * as moment from 'moment';
import { StorageService } from './providers/storage.service';
import { EventsService } from './providers/events.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './providers/auth.service';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Device } from '@ionic-native/device/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  user: any;
  log: boolean;
  i18n: any;
  lang: string;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: StorageService,
    private translateService: TranslateService,
    public auth: AuthService,
    public event: EventsService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private socialSharing: SocialSharing,
    private appVersion: AppVersion,
    private device: Device
  ) {
    this.initializeApp ();
  }

  initializeApp () {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      if (this.platform.is('cordova')) {
        // this.initNotifications ();
      }

      if (this.platform.is ('android')) {
        this.statusBar.overlaysWebView (false);
        this.statusBar.backgroundColorByHexString ('#000000');
      }

      this.storage.getValue ('i18n').then ((response: string) => {
        let lang: string = response;

        if (lang === null || lang === undefined) {
          lang = 'es';
        }
        
        this.translateService.use (lang);
        this.storage.setValue ('i18n', lang);
        moment.locale (lang);
        this.lang = lang;

        this.translateService.getTranslation (lang).subscribe ((i18n: any) => {
          this.i18n = i18n;
          console.log ('i18n', i18n);
        });
      });
    });
  }

  goHome () {
    this.navCtrl.navigateRoot ('home');
  }

  goLoginPage () {
    this.navCtrl.navigateForward ('login');
  }
  
  // initNotifications () {
  //   this.oneSignal.startInit('f62ec6a9-740d-4840-9149-bf759347ce60', '727960214488');
  //   this.oneSignal.inFocusDisplaying (this.oneSignal.OSInFocusDisplayOption.Notification);
  //   this.oneSignal.handleNotificationOpened ().subscribe(async (jsonData: any) => {
  //     const clave = jsonData.notification.payload.additionalData.clave;
  //     const destino: any = JSON.parse (jsonData.notification.payload.additionalData.destino);

  //     if (destino.page === 'ambulancia') {
  //       if (destino.state === 'canceled') {
  //         let alert = await this.alertCtrl.create ({
  //           header: jsonData.notification.payload.title,
  //           message: jsonData.notification.payload.body,
  //           buttons: ['OK']
  //         });
          
  //         await alert.present();
  //       } else {
  //         this.navCtrl.push ("ConfirmAmbulancePage", {
  //           id: clave
  //         });
  //       }
  //     } else if (destino.page === 'farmacia') {
  //       if (destino.state === 'approved' || destino.state === 'observed') {
  //         this.navCtrl.push ("PharmacyPharmacyDeliveryCheckupPage", {
  //           id: clave,
  //           type: 'created'
  //         });
  //       } else {
  //         this.navCtrl.push ("PharmacyPharmacyDeliveryCheckupPage", {
  //           id: clave,
  //           type: destino.state
  //         });
  //       }
  //     } else if (destino.page === 'inyeccion') {
  //       if (destino.state === 'approved' || destino.state === 'observed') {
  //         this.navCtrl.push ("HomeInjectionCheckPage", {
  //           id: clave,
  //           type: 'created'
  //         });
  //       } else {
  //         this.navCtrl.push ("HomeInjectionCheckPage", {
  //           id: clave,
  //           type: destino.state
  //         });
  //       }
  //     } else if (destino.page === 'traslado') {
  //       if (destino.state === 'approved' || destino.state === 'observed') {
  //         this.navCtrl.push ("TransferAmbulanceCheckPage", {
  //           id: clave,
  //           type: 'created'
  //         });
  //       } else {
  //         this.navCtrl.push ("TransferAmbulanceCheckPage", {
  //           id: clave,
  //           type: destino.state
  //         });
  //       }
  //     } else if (destino.page === 'escolta') {
  //       if (destino.state === 'approved' || destino.state === 'observed') {
  //         this.navCtrl.push ("MedicalEscortCheckPage", {
  //           id: clave,
  //           type: 'created'
  //         });
  //       } else {
  //         this.navCtrl.push ("MedicalEscortCheckPage", {
  //           id: clave,
  //           type: destino.state
  //         });
  //       }
  //     } else if (destino.page === 'presion') {
  //       if (destino.state === 'approved' || destino.state === 'observed') {
  //         this.navCtrl.push ("HomePressureCheckPage", {
  //           id: clave,
  //           type: 'created'
  //         });
  //       } else {
  //         this.navCtrl.push ("HomePressureCheckPage", {
  //           id: clave,
  //           type: destino.state
  //         });
  //       }
  //     } else if (destino.page === 'doctor') {
  //       if (destino.state === 'approved' || destino.state === 'observed') {
  //         this.navCtrl.push ("HomeDoctorCheckPage", {
  //           id: clave,
  //           type: 'created'
  //         });
  //       } else {
  //         this.navCtrl.push ("HomeDoctorCheckPage", {
  //           id: clave,
  //           type: destino.state
  //         });
  //       }
  //     } else if (destino.page === 'resultados') {
  //       if (destino.state === 'approved' || destino.state === 'observed') {
  //         this.navCtrl.push ("RequestResultsCheckPage", {
  //           id: clave,
  //           type: 'created'
  //         });
  //       } else {
  //         this.navCtrl.push ("RequestResultsCheckPage", {
  //           id: clave,
  //           type: destino.state
  //         });
  //       }
  //     } 
  //   });

  //   this.oneSignal.handleNotificationReceived().subscribe((jsonData: any) => {
  //     const clave = jsonData.payload.additionalData.clave;
  //     const destino: any = JSON.parse (jsonData.payload.additionalData.destino);

  //     if (destino.page === 'ambulancia') {
  //       if (destino.state === 'canceled') {
  //         let alert = this.alertCtrl.create ({
  //           title: 'Solicitud de ambulancia cancelada',
  //           message: jsonData.payload.body,
  //           buttons: ['OK']
  //         });
          
  //         alert.present();
  //       } else {
  //         let toast = this.toastCtrl.create({
  //           message: jsonData.payload.body,
  //           duration: 5 * 1000,
  //           position: 'top',
  //           closeButtonText: this.i18n.Ver,
  //           showCloseButton: true
  //         });

  //         toast.onDidDismiss((data, role) => {
  //           if (role == "close") {
  //             this.navCtrl.push ("ConfirmAmbulancePage", {
  //               id: clave
  //             });
  //           }
  //         });

  //         toast.present();
  //       }
  //     } else if (destino.page === 'farmacia') {
  //       if (destino.state === 'approved' || destino.state === 'observed') {
  //         let toast = this.toastCtrl.create({
  //           message: jsonData.payload.body,
  //           duration: 10 * 1000,
  //           position: 'top',
  //           closeButtonText: this.i18n.Ver,
  //           showCloseButton: true
  //         });

  //         toast.onDidDismiss((data, role) => {
  //           if (role == "close") {
  //             this.navCtrl.push ("PharmacyPharmacyDeliveryCheckupPage", {
  //               id: clave,
  //               type: 'created'
  //             });
  //           }
  //         });

  //         toast.present();
  //       } else {
  //         let toast = this.toastCtrl.create({
  //           message: jsonData.payload.body,
  //           duration: 10 * 1000,
  //           position: 'top',
  //           closeButtonText: this.i18n.Ver,
  //           showCloseButton: true
  //         });

  //         toast.onDidDismiss((data, role) => {
  //           if (role == "close") {
  //             this.navCtrl.push ("PharmacyPharmacyDeliveryCheckupPage", {
  //               id: clave,
  //               type: destino.state
  //             });
  //           }
  //         });

  //         toast.present();
  //       }
  //     } else if (destino.page === 'inyeccion') {
  //       if (destino.state === 'approved' || destino.state === 'observed') {
  //         let toast = this.toastCtrl.create({
  //           message: jsonData.payload.body,
  //           duration: 10 * 1000,
  //           position: 'top',
  //           closeButtonText: this.i18n.Ver,
  //           showCloseButton: true
  //         });

  //         toast.onDidDismiss((data, role) => {
  //           if (role == "close") {
  //             this.navCtrl.push ("HomeInjectionCheckPage", {
  //               id: clave,
  //               type: 'created'
  //             });
  //           }
  //         });

  //         toast.present();
  //       } else {
  //         let toast = this.toastCtrl.create({
  //           message: jsonData.payload.body,
  //           duration: 10 * 1000,
  //           position: 'top',
  //           closeButtonText: this.i18n.Ver,
  //           showCloseButton: true
  //         });

  //         toast.onDidDismiss((data, role) => {
  //           if (role == "close") {
  //             this.navCtrl.push ("HomeInjectionCheckPage", {
  //               id: clave,
  //               type: destino.state
  //             });
  //           }
  //         });

  //         toast.present();
  //       }
  //     } else if (destino.page === 'traslado') {
  //       if (destino.state === 'approved' || destino.state === 'observed') {
  //         let toast = this.toastCtrl.create({
  //           message: jsonData.payload.body,
  //           duration: 10 * 1000,
  //           position: 'top',
  //           closeButtonText: this.i18n.Ver,
  //           showCloseButton: true
  //         });

  //         toast.onDidDismiss((data, role) => {
  //           if (role == "close") {
  //             this.navCtrl.push ("TransferAmbulanceCheckPage", {
  //               id: clave,
  //               type: 'created'
  //             });
  //           }
  //         });

  //         toast.present();
  //       } else {
  //         let toast = this.toastCtrl.create({
  //           message: jsonData.payload.body,
  //           duration: 10 * 1000,
  //           position: 'top',
  //           closeButtonText: this.i18n.Ver,
  //           showCloseButton: true
  //         });

  //         toast.onDidDismiss((data, role) => {
  //           if (role == "close") {
  //             this.navCtrl.push ("TransferAmbulanceCheckPage", {
  //               id: clave,
  //               type: destino.state
  //             });
  //           }
  //         });

  //         toast.present();
  //       }
  //     } else if (destino.page === 'escolta') {
  //       if (destino.state === 'approved' || destino.state === 'observed') {
  //         let toast = this.toastCtrl.create({
  //           message: jsonData.payload.body,
  //           duration: 10 * 1000,
  //           position: 'top',
  //           closeButtonText: this.i18n.Ver,
  //           showCloseButton: true
  //         });

  //         toast.onDidDismiss((data, role) => {
  //           if (role == "close") {
  //             this.navCtrl.push ("MedicalEscortCheckPage", {
  //               id: clave,
  //               type: 'created'
  //             });
  //           }
  //         });

  //         toast.present();
  //       } else {
  //         let toast = this.toastCtrl.create({
  //           message: jsonData.payload.body,
  //           duration: 10 * 1000,
  //           position: 'top',
  //           closeButtonText: this.i18n.Ver,
  //           showCloseButton: true
  //         });

  //         toast.onDidDismiss((data, role) => {
  //           if (role == "close") {
  //             this.navCtrl.push ("MedicalEscortCheckPage", {
  //               id: clave,
  //               type: destino.state
  //             });
  //           }
  //         });

  //         toast.present();
  //       }
  //     } else if (destino.page === 'presion') {
  //       if (destino.state === 'approved' || destino.state === 'observed') {
  //         let toast = this.toastCtrl.create({
  //           message: jsonData.payload.body,
  //           duration: 10 * 1000,
  //           position: 'top',
  //           closeButtonText: this.i18n.Ver,
  //           showCloseButton: true
  //         });

  //         toast.onDidDismiss((data, role) => {
  //           if (role == "close") {
  //             this.navCtrl.push ("HomePressureCheckPage", {
  //               id: clave,
  //               type: 'created'
  //             });
  //           }
  //         });

  //         toast.present();
  //       } else {
  //         let toast = this.toastCtrl.create({
  //           message: jsonData.payload.body,
  //           duration: 10 * 1000,
  //           position: 'top',
  //           closeButtonText: this.i18n.Ver,
  //           showCloseButton: true
  //         });

  //         toast.onDidDismiss((data, role) => {
  //           if (role == "close") {
  //             this.navCtrl.push ("HomePressureCheckPage", {
  //               id: clave,
  //               type: destino.state
  //             });
  //           }
  //         });

  //         toast.present();
  //       }
  //     } else if (destino.page === 'doctor') {
  //       if (destino.state === 'approved' || destino.state === 'observed') {
  //         let toast = this.toastCtrl.create({
  //           message: jsonData.payload.body,
  //           duration: 10 * 1000,
  //           position: 'top',
  //           closeButtonText: this.i18n.Ver,
  //           showCloseButton: true
  //         });

  //         toast.onDidDismiss((data, role) => {
  //           if (role == "close") {
  //             this.navCtrl.push ("HomeDoctorCheckPage", {
  //               id: clave,
  //               type: 'created'
  //             });
  //           }
  //         });

  //         toast.present();
  //       } else {
  //         let toast = this.toastCtrl.create({
  //           message: jsonData.payload.body,
  //           duration: 10 * 1000,
  //           position: 'top',
  //           closeButtonText: this.i18n.Ver,
  //           showCloseButton: true
  //         });

  //         toast.onDidDismiss((data, role) => {
  //           if (role == "close") {
  //             this.navCtrl.push ("HomeDoctorCheckPage", {
  //               id: clave,
  //               type: destino.state
  //             });
  //           }
  //         });

  //         toast.present();
  //       }
  //     } else if (destino.page === 'resultados') {
  //       if (destino.state === 'approved' || destino.state === 'observed') {
  //         let toast = this.toastCtrl.create({
  //           message: jsonData.payload.body,
  //           duration: 10 * 1000,
  //           position: 'top',
  //           closeButtonText: this.i18n.Ver,
  //           showCloseButton: true
  //         });

  //         toast.onDidDismiss((data, role) => {
  //           if (role == "close") {
  //             this.navCtrl.push ("RequestResultsCheckPage", {
  //               id: clave,
  //               type: 'created'
  //             });
  //           }
  //         });

  //         toast.present();
  //       } else {
  //         let toast = this.toastCtrl.create({
  //           message: jsonData.payload.body,
  //           duration: 10 * 1000,
  //           position: 'top',
  //           closeButtonText: this.i18n.Ver,
  //           showCloseButton: true
  //         });

  //         toast.onDidDismiss((data, role) => {
  //           if (role == "close") {
  //             this.navCtrl.push ("RequestResultsCheckPage", {
  //               id: clave,
  //               type: destino.state
  //             });
  //           }
  //         });

  //         toast.present();
  //       }
  //     } 
  //   });

  //   this.oneSignal.endInit();
    
  //   this.auth.getUsuario ().subscribe (async (user: any) => {
  //     this.oneSignal.getIds ().then (oS => {
  //       this.storage.setValue ("token_id", oS.userId)

  //       if (user) {
  //         this.database.updateToken (user.uid, oS.userId);
  //       }
  //     });
  //   });

  //   this.oneSignal.getTags ().then (data => {
  //     console.log (data);
  //   });

  //   this.oneSignal.sendTag ("Usuarios", "true");
  // }

  async signOut () {
    let alert = await this.alertCtrl.create({
      header: this.i18n.SIGN_OFF, 
      message: this.i18n.cerrar_sesión_message,
      buttons: [
        {
          text: this.i18n.CANCEL,
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: this.i18n.Si,
          handler: () => {
            this.auth.signOut ().then (() => {
              this.storage.setValue ("uid", null);
              this.event.publishDeslogeado (null);
            }, error => {

            });
          }
        }
      ]
    });

    await alert.present();
  }

  goOrdersHistory () {
    this.navCtrl.navigateForward ("orders-history");
  }

  goAppointmentHistory () {
    this.navCtrl.navigateForward ('appointment-history');
  }

  async changeLanguage () {
    let alert = await this.alertCtrl.create({
      header: 'Seleccione un idioma',
      inputs: [
        {
          name: 'es',
          type: 'radio',
          label: 'Español',
          value: 'es'
        },
        {
          name: 'en',
          type: 'radio',
          label: 'English',
          value: 'en'
        },
        {
          name: 'iw_IL',
          type: 'radio',
          label: 'עברית',
          value: 'iw_IL'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        }, 
        {
          text: 'Seleccionar',
          handler: (data) => {
            console.log (data);
              
            this.translateService.use(data);
            this.storage.setValue ("i18n", data);
            moment.locale(data);
            this.lang = data;
            // this.events.publish ('i18n_changed', data);
            this.translateService.getTranslation (data).subscribe ((i18n: any) => {
              this.i18n = i18n;
            });
          }
        }
      ]
    });

    await alert.present ();
  }

  goWork () {
    this.storage.getValue ("i18n").then ((lang) => {
      if (lang === 'es') {
        window.open ("http://preview.cps.com.pe/es/word-whitus", "_blank", "location=yes");
      } else {
        window.open ("http://preview.cps.com.pe/word-whitus", "_blank", "location=yes");
      }
    });
  }

  goBlogs () {
    this.storage.getValue ("i18n").then ((lang) => {
      if (lang === 'es') {
        window.open ("http://preview.cps.com.pe/es/articles", "_blank", "location=yes");
      } else {
        window.open ("http://preview.cps.com.pe/articles", "_blank", "location=yes");
      }
    });
  }

  goAbout () {
    this.storage.getValue ("i18n").then ((lang) => {
      if (lang === 'es') {
        window.open ("http://preview.cps.com.pe/es/whyus", "_blank", "location=yes");
      } else {
        window.open ("http://preview.cps.com.pe/whyus", "_blank", "location=yes");
      }
    });
  }

  goPartner () {
    this.storage.getValue ("i18n").then ((lang) => {
      if (lang === 'es') {
        window.open ("http://preview.cps.com.pe/es/partner", "_blank", "location=yes");
      } else {
        window.open ("http://preview.cps.com.pe/partner", "_blank", "location=yes");
      }
    });
  }

  reportIssue () {
    this.appVersion.getVersionNumber ().then (app_version => {
      const body_es: string = '- Describe el error<br>' + 
                            'Una descripción clara y concisa de lo que es el error.<br><br>' +
                            '- Reproducir<br>' + 
                            '1. Ir a "..."<br>' +
                            '2. Haga clic en "..."<br>' +
                            '3. Desplácese hacia abajo hasta "..."<br>' +
                            '4. Ver error<br><br>' +
                            '- Mensaje adicional<br>' +
                            'Agregue cualquier otro mensaje sobre el problema aquí.<br><br>' + 
                            '- Información técnica<br>' +
                            'Modelo de dispositivo: ' + this.device.model + '<br>' +
                            'Versión: ' + this.device.version + '<br>' +
                            'Version de aplicacion: ' + app_version + '<br>';


      const body_en: string = '- Describe the bug<br>' + 
                              'A clear and concise description of what the bug is.<br><br>' +
                              '- To Reproduce<br>' + 
                              '1. Go to "..."<br>' +
                              '2. Click on "..."<br>' +
                              '3. Scroll down to "...."<br>' +
                              '4. See error<br><br>' +  
                              '- Additional context<br>' +
                              'Add any other context about the problem here.<br><br>'
                              '- Technical information<br>' +
                              'Device model: ' + this.device.model + '<br>' +
                              'Version: ' + this.device.version + '<br>' +
                              'App Version: ' + app_version + '<br>';

      let body: string = "";
      let subject: string = "";

      this.storage.getValue ("i18n").then ((lang) => {
        if (lang === 'es') {
          body = body_es;
          subject = "Informe de error";
        } else {
          body = body_en;
          subject = "Bug report";
        }

        console.log ('Body', body);
        console.log ('Subject', subject);

        this.socialSharing.shareViaEmail (body, subject, ['puntoproapp@gmail.com'])
          .then(() => {
            // OK
          }).catch(() => {
          // Error!
          });
      });
    });
  }

  getFlat () {
    return "/assets/icon/" + this.lang + ".png";
  }
}
