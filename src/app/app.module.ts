import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Firebase
import { environment } from '../environments/environment';

// Firebase
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';

// Redes Sociales
import { GooglePlus } from '@ionic-native/google-plus/ngx';

// LLamada de Telefono
import { CallNumber } from '@ionic-native/call-number/ngx';

// AppAvailability
import { AppAvailability } from '@ionic-native/app-availability/ngx';

// Storage
import { IonicStorageModule } from '@ionic/storage';

// Traduccion
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

// Camara
// import { BackgroundGeolocation } from '@ionic-native/background-geolocation/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Device } from '@ionic-native/device/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Facebook } from '@ionic-native/facebook/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { CustomFormsModule } from 'ng2-validation'
import { OneSignal } from '@ionic-native/onesignal/ngx';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// Modals
import { MapSelectPageModule } from './modals/map-select/map-select.module';
import { PaisesCodsPageModule } from './modals/paises-cods/paises-cods.module';
import { PayPageModule } from './modals/pay/pay.module';
import { CountrySelectPageModule } from './modals/country-select/country-select.module';
import { CalificacionPageModule } from './modals/calificacion/calificacion.module';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      mode: 'md'
    }),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    IonicStorageModule.forRoot (),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient]
      }
    }),
    MapSelectPageModule,
    PaisesCodsPageModule,
    CustomFormsModule,
    PayPageModule,
    CountrySelectPageModule,
    CalificacionPageModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    GooglePlus,
    CallNumber,
    Geolocation,
    AndroidPermissions,
    LocationAccuracy,
    Device,
    Camera,
    SocialSharing,
    Facebook,
    AppAvailability,
    OneSignal,
    AppVersion,
    // BackgroundGeolocation,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
