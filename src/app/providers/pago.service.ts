import { Injectable } from '@angular/core';

import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { EventsService } from '../providers/events.service';

declare var Culqi: any;

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  constructor(public http: HttpClient,
              private events: EventsService
              ) {
  document.addEventListener ('payment_event', (token: any) => {
    let token_id = token.detail;
    this.events.publishSomeData (token_id);
    }, false);
  }

  initCulqi () {
    // Ingresa tu "Puclic Key" que te da Culqi aqui
    Culqi.publicKey = 'pk_live_cfHayQoNWmCbKm6y';
    // Culqi.publicKey = 'pk_test_yycfYRkVXy5z38km';
  }

  cfgFormulario (descripcion: string, cantidad: number) {
    Culqi.getOptions.style.logo = "https://firebasestorage.googleapis.com/v0/b/cps-database.appspot.com/o/icon-240.png?alt=media&token=4a678de0-f8ad-4370-a60d-be2e305d5d77";
      Culqi.settings ({
      title: 'Clínica Peruano Suiza',
      currency: 'PEN',
      description: descripcion,
      amount: cantidad
    });
  }

  open () {
    Culqi.open ();
  }
}
