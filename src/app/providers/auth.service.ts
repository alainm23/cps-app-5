import { Injectable } from '@angular/core';

// Translate Service
import { TranslateService } from '@ngx-translate/core';

import { AngularFireAuth } from '@angular/fire/auth';
import { DatabaseService } from '../providers/database.service';
import { StorageService } from '../providers/storage.service';
import { ApiService } from '../providers/api.service';
  
import { Platform, LoadingController, AlertController, NavController } from '@ionic/angular';

// Google Login
import { GooglePlus } from '@ionic-native/google-plus/ngx';  
import "rxjs/add/operator/take"

// Facebook
import { Facebook } from '@ionic-native/facebook/ngx';

import { first, map } from 'rxjs/operators';

// Firebase
import * as firebase from 'firebase/app';
import { async } from '@angular/core/testing';

// Apple
import { SignInWithApple, AppleSignInResponse, AppleSignInErrorResponse, ASAuthorizationAppleIDRequest } from '@ionic-native/sign-in-with-apple';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loading: any;

  user: any = {
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number:'',
    type: '',
    is_free: '',
    country_name: '',
    country_dial_code: '',
    country_code: '',
    disabled: false
  }

  is_logged: boolean;

  constructor(
              public afAuth: AngularFireAuth,
              private api: ApiService,
              private database: DatabaseService,
              public loadingCtrl: LoadingController,
              private googlePlus: GooglePlus,
              private facebook: Facebook,
              private translateService: TranslateService,
              private storage: StorageService,
              public alertCtrl: AlertController,
              private navController: NavController,
              private platform: Platform) {
    this.afAuth.authState.subscribe (response => {
      if (response) {
        this.storage.setValue ("uid", response.uid);
        this.is_logged = true;
        
        this.database.getUser (response.uid).subscribe ((data) => {
          this.user = data;
        });
      } else {
        this.is_logged = false;
      }
    });
  }

  authState () {
    return this.afAuth.authState;
  }

  async isLogin () {
    return this.afAuth.authState.pipe(first()).toPromise();  
  }

  getUsuario () {
    return this.afAuth.authState;
  }

  loginEmailPassword (email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword (email, password);
  }

  async signOut () {
    return this.afAuth.auth.signOut ()
      .then (() => {
        this.facebook.getLoginStatus ().then ((res) => {
          if (res.status === 'connected') {
            this.facebook.logout ();
          }
        });
      });
  }

  addUser (correo: string, password: string) {
    return this.afAuth.auth.createUserWithEmailAndPassword (correo, password);
  }

  googleLogin () {
    if (this.platform.is ('cordova')) {
      this.nativeGoogleLogin ();
    } else {
      this.webGoogleLogin ();
    }
  }

  sendPasswordResetEmail (email: string) {
    return this.afAuth.auth.sendPasswordResetEmail (email);
  }
  
  async nativeGoogleLogin () {
    const loading = await this.loadingCtrl.create({
      message: 'Procesando informacion...',
      spinner: 'dots'
    });

    await loading.present ();

    this.googlePlus.login ({
      'scope': 'cpsappweb@gmail.com',
      'webClientId': '727960214488-rjv4mrhf0fnre8oprpogcqiv5g2e4l32.apps.googleusercontent.com',
      'offline': true
    }).then (async (res: any) => {
      const credential = await this.afAuth.auth.signInWithCredential (firebase.auth.GoogleAuthProvider.credential(res.idToken));
      const unsuscribe = this.database.getUser (credential.user.uid).subscribe (async (response: any) => {
        unsuscribe.unsubscribe ();

        if (response === undefined) {
          let user: any = {
            id: credential.user.uid,
            first_name: credential.user.displayName,
            last_name: '',
            email: credential.user.email,
            phone_number: '', 
            type: 'user',
            is_free: false,
            country_name: '',
            country_dial_code: '',
            country_code: '',
            token_id: '',
            disabled: false
          };

          this.database.addUser (credential.user.uid, user)
            .then (() => {
              loading.dismiss ();
              this.navController.navigateRoot ('home');
              this.api.enviarcorreologinapp (this.translateService.getDefaultLang (),
                                            user.first_name + ' ' + user.last_name,
                                            user.email);
            })
            .catch ((error: any) => {
              loading.dismiss ();
              console.log ("Error login", error);
            });
        } else {
          loading.dismiss ();

          if (response.disabled) {
            const alert = await this.alertCtrl.create({
              header: 'Usuario bloqueado',
              subHeader: 'Su usuario ha sido bloqueado, contacte al administrador',
              buttons: ['OK']
            });

            await alert.present();
  
            this.signOut ();
          } else {
            this.navController.navigateRoot ('home');
          }
        }
      }, error => {
        loading.dismiss ();
        console.log ('Database error, ', error);
      });
    }).catch (err => {
      console.log ('googlePlus', err);
      loading.dismiss ();
    });
  }
  
  async webGoogleLogin () {
    const loading = await this.loadingCtrl.create ({
      message: 'Procesando...'
    });

    await loading.present ();

    const provider = new firebase.auth.GoogleAuthProvider ();
    const credential = await this.afAuth.auth.signInWithPopup (provider);

    console.log (credential);

    this.database.isUser (credential.user.uid).pipe (first ()).toPromise ().then (async (data: any) => {
      if (data === undefined || data === null) {
        // Si el usuario no exixte, creamos uno nuevo en la basde de datos 
        let user: any = {
          id: credential.user.uid,
          first_name: credential.user.displayName,
          last_name: '',
          email: credential.user.email,
          phone_number: '', 
          type: 'user',
          is_free: false,
          country_name: '',
          country_dial_code: '',
          country_code: '',
          token_id: '',
          disabled: false
        };

        this.database.addUser (credential.user.uid, user)
          .then (() => {
            loading.dismiss ();
            this.navController.navigateRoot ('home');
            this.api.enviarcorreologinapp (this.translateService.getDefaultLang (),
                                            user.first_name + ' ' + user.last_name,
                                            user.email);
          })
          .catch ((error: any) => {
            loading.dismiss ();
            console.log ("Error login", error);
          });
      } else {
        loading.dismiss ();

        if (data.disabled) {
          const alert = await this.alertCtrl.create({
            header: 'Usuario bloqueado',
            subHeader: 'Su usuario ha sido bloqueado, contacte al administrador',
            buttons: ['OK']
          });

          await alert.present ();

          this.signOut ();
        } else {
          this.navController.navigateRoot ('home');
        }
      }
    });
  }

  facebookLogin () {
    if (this.platform.is ('cordova')) {
      this.nativeFacebookLogin ();
    } else {
      this.webFacebookLogin ();
    }
  }
  
  async nativeFacebookLogin () {
    const loading = await this.loadingCtrl.create ({
      message: 'Procesando...'
    });

    await loading.present ();

    this.facebook.getLoginStatus ().then((res) => {
      console.log ('getLoginStatus', res);

      if (res.status === 'connected') {
        console.log ("Facebook user ya logeado");

        this.afAuth.auth.signInAndRetrieveDataWithCredential (firebase.auth.FacebookAuthProvider.credential (res.authResponse.accessToken))
        .then ((credential: any) => {
          console.log ("Conectado:", credential);

          this.check_facebook_user (credential, loading);
        })
        .catch ((error: any) => {
          console.log ('this.afAuth.auth.signInAndRetrieveDataWithCredential', error);
          loading.dismiss ();
        });
      } else {
        console.log ("Facebook Primer Logeo");

        this.facebook.login (['public_profile', 'email'])
        .then ((facebookUser: any) => {
          console.log ('facebookUser', facebookUser)

          this.afAuth.auth.signInAndRetrieveDataWithCredential (firebase.auth.FacebookAuthProvider.credential (facebookUser.authResponse.accessToken))
          .then ((credential: any) => {
            console.log ("Primer login:", credential);
            this.check_facebook_user (credential, loading);
          })
          .catch ((error: any) => {
            console.log ('this.afAuth.auth.signInAndRetrieveDataWithCredential', error);
            loading.dismiss ();
          });
        })
        .catch ((error: any) => {
          console.log ('this.facebook.login', error);
          loading.dismiss ();
        });
      }
    });
  }

  check_facebook_user (credential: any, loading: any) {
    this.database.isUser (credential.user.uid).pipe (first ()).toPromise ().then (async (data: any) => {
      if (data == undefined || data == null) {
        // Si el usuario no exixte, creamos uno nuevo en la basde de datos 
        let user: any = {
          id: credential.user.uid,
          first_name: credential.user.displayName,
          last_name: '',
          email: credential.user.email,
          phone_number: '', 
          type: 'user',
          is_free: false,
          country_name: '',
          country_dial_code: '',
          country_code: '',
          token_id: '',
          disabled: false
        };

        this.database.addUser (credential.user.uid, user)
          .then (() => {
            loading.dismiss ();
            this.navController.navigateRoot ('home');
            this.api.enviarcorreologinapp (this.translateService.getDefaultLang (),
                                            user.first_name + ' ' + user.last_name,
                                            user.email);
          })
          .catch (error => {
            loading.dismiss ();
            console.log ("Error login", error);
          });
      } else {
        loading.dismiss ();

        if (data.disabled) {
          const alert = await this.alertCtrl.create({
            header: 'Usuario bloqueado',
            subHeader: 'Su usuario ha sido bloqueado, contacte al administrador',
            buttons: ['OK']
          });

          await alert.present ();

          this.signOut ();
        } else {
          this.navController.navigateRoot ('home');
        }
      }
    });
  }

  async webFacebookLogin () {
    const loading = await this.loadingCtrl.create ({
      message: 'Procesando...'
    });

    await loading.present ();

    const provider = new firebase.auth.FacebookAuthProvider();
    this.afAuth.auth.signInWithRedirect (provider)
      .then ((credential: any) => {
        this.database.isUser (credential.user.uid).pipe (first ()).toPromise ().then (async (data: any) => {
          if (data == undefined || data == null) {
            // Si el usuario no exixte, creamos uno nuevo en la basde de datos 
            let user: any = {
              id: credential.user.uid,
              first_name: credential.user.displayName,
              last_name: '',
              email: credential.user.email,
              phone_number: '', 
              type: 'user',
              is_free: false,
              country_name: '',
              country_dial_code: '',
              country_code: '',
              token_id: '',
              disabled: false
            };
  
            this.database.addUser (credential.user.uid, user)
              .then (() => {
                loading.dismiss ();
                this.navController.navigateRoot ('home');
                this.api.enviarcorreologinapp (this.translateService.getDefaultLang (),
                                                user.first_name + ' ' + user.last_name,
                                                user.email);
              })
              .catch (error => {
                loading.dismiss ();
                console.log ("Error login", error);
              });
          } else {
            loading.dismiss ();
  
            if (data.disabled) {
              const alert = await this.alertCtrl.create({
                header: 'Usuario bloqueado',
                subHeader: 'Su usuario ha sido bloqueado, contacte al administrador',
                buttons: ['OK']
              });

              await alert.present ();
  
              this.signOut ();
            } else {
              this.navController.navigateRoot ('home');
            }
          }
        });
      })
      .catch ((error: any) => {
        loading.dismiss ();
        console.log ("Error login", error);
      });
  }

  async appleLogin () {
    try {
      const appleCredential: AppleSignInResponse = await SignInWithApple.signin ({
        requestedScopes: [
          ASAuthorizationAppleIDRequest.ASAuthorizationScopeFullName,
          ASAuthorizationAppleIDRequest.ASAuthorizationScopeEmail
        ]
      });
      const credential = new firebase.auth.OAuthProvider ('apple.com').credential (
        appleCredential.identityToken
      );

      this.afAuth.auth.signInWithCredential (credential)
        .then (async (credential) => {
          const loading = await this.loadingCtrl.create ({
            message: 'Procesando...'
          });
      
          await loading.present ();

          this.database.isUser (credential.user.uid).pipe (first ()).toPromise ().then (async (data: any) => {
            if (data === undefined || data === null) {
              // Si el usuario no exixte, creamos uno nuevo en la basde de datos 
              let user: any = {
                id: credential.user.uid,
                first_name: credential.user.displayName,
                last_name: '',
                email: credential.user.email,
                phone_number: '', 
                type: 'user',
                is_free: false,
                country_name: '',
                country_dial_code: '',
                country_code: '',
                token_id: '',
                disabled: false
              };
      
              this.database.addUser (credential.user.uid, user)
                .then (() => {
                  loading.dismiss ();
                  this.navController.navigateRoot ('home');
                  this.api.enviarcorreologinapp (this.translateService.getDefaultLang (),
                                                  user.first_name + ' ' + user.last_name,
                                                  user.email);
                })
                .catch ((error: any) => {
                  loading.dismiss ();
                  console.log ("Error login", error);
                });
            } else {
              loading.dismiss ();
      
              if (data.disabled) {
                const alert = await this.alertCtrl.create({
                  header: 'Usuario bloqueado',
                  subHeader: 'Su usuario ha sido bloqueado, contacte al administrador',
                  buttons: ['OK']
                });
      
                await alert.present ();
      
                this.signOut ();
              } else {
                this.navController.navigateRoot ('home');
              }
            }
          });
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  }
}
