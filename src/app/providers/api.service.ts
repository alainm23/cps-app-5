import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  API: string;
  constructor (public http: HttpClient, public loadingCtrl: LoadingController ) {
    this.API = 'https://api.cps.com.pe/api';
  }

  getEspecialidades (lang: string) {
    let url = this.API + '/getespecialidades/' + lang;
     
    console.log ("URL: ", url); 
    
    return this.http.get (url).map ((data: any) => {
        return data.especialidades;      
    }, (error: HttpErrorResponse) => {
      if (error.error instanceof Error) {
        console.log("Client-side error occured.");
      } else {
        console.log("Server-side error occured.");
      }
    });
  }

  getServices (lang: string) {
    let url = this.API + '/getservicios/' + lang;
    
    console.log ("URL: ", url);

    return this.http.get (url).map ((data: any) => {
        return data.especialidades;      
    }, (error: HttpErrorResponse) => {
      if (error.error instanceof Error) {
        console.log("Client-side error occured.");
      } else {
        console.log("Server-side error occured.");
      }
    });
  }

  getsintomas (lang: string) {
    let url = this.API + '/getsintomas/' + lang;
    
    return this.http.get (url).map ((data: any) => {
        return data.sintomas;      
    }, (error: HttpErrorResponse) => {
      if (error.error instanceof Error) {
        console.log("Client-side error occured.");
      } else {
        console.log("Server-side error occured.");
      }
    });
  }
  
  getvariaciones (id: string, lang: string) {
    let url = this.API + '/getvariaciones/' + id + '/' + lang;

    console.log (url);

    return this.http.get (url).map ((data: any) => {
        return data.variaciones;      
    }, (error: HttpErrorResponse) => {
      if (error.error instanceof Error) {
        console.log("Client-side error occured.");
      } else {
        console.log("Server-side error occured.");
      }
    });
  }

  getCitasEspecialidad (name: string) {
    let url = this.API + '/getcitasespecialidad/' + name;

    return this.http.get (url).map ((data: any) => {
        return data.citas;      
    }, (error: HttpErrorResponse) => {
      if (error.error instanceof Error) {
        console.log("Client-side error occured.");
      } else {
        console.log("Server-side error occured.");
      }
    });
  }

  getHorariosFecha (medico_id: string, date: string) {
    let url = this.API + '/gethorariosfecha/' + medico_id + '/' + date;
    
    console.log ("url", url);

    return this.http.get (url).map ((data: any) => {
      return data.horas;  
    }, (error: HttpErrorResponse) => {
      if (error.error instanceof Error) {
        console.log("Client-side error occured.");
      } else {
        console.log("Server-side error occured.");
      }
    });
  }

  sendMessage (data: any) {
    let url = this.API + '/enviaremergenciaapp';
    return this.http.post (url, data);
  }

  procesarPago (data: any, titular: any) {
    let url = this.API + '/procesarpagoapp/';
    url += data.token + "/";
    url += data.monto + "/";
    url += data.correo + "/";
    url += data.moneda + "/";
    url += data.des + "/";
    url += data.consulta + "/";
    url += data.doctor + '/';

    url += titular.nombres + '/';
    url += titular.apellidos + '/';
    url += titular.email + '/';
    url += titular.direccion + '/';
    url += titular.pais_code + '/';
    url += titular.ciudad + '/';
    url += titular.telefono;

    console.log ("URL: " + url);

    return this.http.get (url).map ((data: any) => {
        return data;      
    }, (error: HttpErrorResponse) => {
      if (error.error instanceof Error) {
        console.log("Client-side error occured.");
      } else {
        console.log("Server-side error occured.");
      }
    });
  }

  procesarPago2 (data: any, titular: any) {
    let url = this.API + '/procesarpago2app/';

    url += data.token + "/";
    url += data.monto + "/";
    url += data.correo + "/";
    url += data.moneda + "/";
    url += data.des + '/';
    url += titular.nombres + '/';
    url += titular.apellidos + '/';
    url += titular.email + '/';
    url += titular.direccion + '/';
    url += titular.pais_code + '/';
    url += titular.ciudad + '/';
    url += titular.telefono;

    console.log (url);

    // return this.http.get (url);
    return this.http.get (url).map ((data: any)=> {
      return data;
    }, (error: HttpErrorResponse) => {
      if (error.error instanceof Error) {
        console.log("Client-side error occured.");
      } else {
        console.log("Server-side error occured.");
      }
    });
  }
  
  checkoutapp (data: any) {
    let url = this.API + '/checkoutapp';
    return this.http.post (url, data);
  }

  pushNotification (data: any) {
    data.tipo = 'admin';

    let url = this.API + '/send-notification';
    return this.http.post (url, data);
  }

  enviarcorreologinapp (idioma: string, nombres: string, email: string) {
    const url = this.API + '/enviarcorreologinapp';
     
    const request: any = {
      idioma: idioma,
      nombres: nombres,
      email: email
    };

    return this.http.post (url, request);
  }
}
