import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { first, map } from 'rxjs/operators';
import { combineLatest, of } from "rxjs/index";

import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  constructor(private afs: AngularFirestore, private http: HttpClient) {

  }
  
  getSendAmbulance (id: string) {
    return this.afs.collection ("Emergencias_Progreso").doc (id).valueChanges ();
  }
 
  async addSendAmbulance (data: any, id: string, save_number: boolean) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ('Emergencias_Progreso').doc (id).ref;

    if (save_number) {
      let step_3 = this.afs.collection ('Users').doc (id).ref;
      batch.update (step_3, {
        'country_code': data.country_code,
        'country_dial_code': data.country_dial_code,  
        'country_name': data.country_name,
        'phone_number': data.phone_number
      });
    }

    batch.set (step_1, data);

    await batch.commit ();
  }

  getSendAmbulancesLocation (id: string) {
    return this.afs.collection ('Emergencias_Progreso').doc (id).collection ('tracking').doc ('tracking').valueChanges ();
  }
  
  async cancelSendAmbulance (data: any, message: string) {
    data.why_canceled = message;

    const codigo = this.afs.createId ();

    var batch = this.afs.firestore.batch ();
    
    let step_1 = this.afs.collection ('Emergencias_Progreso').doc (data.id).ref;
    batch.delete (step_1);

    let step_2 = this.afs.collection ('Emergencias_Canceladas').doc (codigo).ref;
    batch.set (step_2, data);

    let step_3 = this.afs.collection ('Usuario_Cancelados').doc (data.id).collection ("Emergencias").doc (codigo).ref;
    batch.set (step_3, { 'id': codigo });

    let step_4 = this.afs.collection ('Admin_Canceladas').doc ("Emergencias").collection (moment().format('YYYY[-]MM')).doc (codigo).ref;
    batch.set (step_4, { 'id': codigo });
    
    return await batch.commit (); 
  }

  async updateSendAmbulanceArrived (data: any) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ('SendAmbulances').doc (data.id).ref;
    let step_2 = this.afs.collection ('SendAmbulancesFinalized').doc (data.id).ref;
    let step_3 = this.afs.collection ('SendAmbulancesSent').doc (data.id).ref;
    let step_4 = this.afs.collection ('Ambulances').doc (data.ambulance_id).ref;
    let step_5 = this.afs.collection ('Users').doc (data.driver_id).ref;

    batch.update (step_1, { 'state': 'finalized', 'who_finished': 'user' });
    batch.set (step_2, { 'id': data.id, 'driver_id': data.driver_id });
    batch.delete (step_3);
    batch.update (step_4, { 'is_free': true, 'driver_id': data.driver_id, 'order_id': data.id });
    batch.update (step_4, { 'is_free': true });

    return await batch.commit ();
  }

  updateSendAmbulance (id: string, arrived: boolean, canceled: boolean) {
    return this.afs.collection<any> ("SendAmbulances").doc (id).update ({
                                                                        is_arrived: arrived, 
                                                                        is_canceled: canceled, 
                                                                        who_canceled: 'user',
                                                                       });
  }

  // User

  addUser (id: string, data: any) {
    return this.afs.collection<any> ("Users").doc (id).set (data);
  }

  getUser (id: string) {
    return this.afs.collection<any> ("Users").doc (id).valueChanges ();
  }

  isUser (id: string) {
    return this.afs.collection<any> ("Users").doc (id).valueChanges ();
  }

  createId () {
    return this.afs.createId ();
  }

  updateToken (uid: string, token: string) {
    return this.afs.collection ("Users").doc (uid).update ({
      token_id: token
    });
  }
  // Delivery -------------------------------------------
  async addDelivery (id: string, data: any, extra: any) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection('Farmacia_Proceso').doc (id).ref;
    let step_2 = this.afs.collection('Users').doc (id).ref;

    batch.set (step_1, data);
    batch.update (step_2, {
      'country_code': extra.code,
      'country_dial_code': extra.dial_code,
      'country_name': extra.name,
      'phone_number': data.user_phone_number
    })
    
    await batch.commit ();

    return id;
  }

  getDeliveryObservations (id: string) {
    return this.afs.collection ('Farmacia_Proceso').doc (id).collection ('observations', ref => ref.orderBy ('date')).valueChanges ();
  }
  
  async updateDelivery (id: string, data: any) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ("Farmacia_Proceso").doc (id).ref;

    batch.update (step_1, data);
    
    return await batch.commit ();
  }

  getDelivery (uid: string) {
    return this.afs.collection ('Farmacia_Proceso').doc (uid).valueChanges ();
  }

  async updateDeliveryCanceled (id: string, data: any, observations: any) {
    const id_old = data.id;
    const codigo = this.afs.createId ();
    data.id = codigo;

    var batch = this.afs.firestore.batch ();
    
    for (let item of observations) {
      let any_1 = this.afs.collection ('Farmacia_Proceso').doc (id_old).collection ('observations').doc (item.id).ref;
      batch.delete (any_1);
      
      let any_2 = this.afs.collection ('Farmacia_Cancelados').doc (codigo).collection ('observations').doc (item.id).ref;
      batch.set (any_2, item);
    }

    let step_1 = this.afs.collection ('Farmacia_Proceso').doc (id_old).ref;
    batch.delete (step_1);

    let step_2 = this.afs.collection ('Farmacia_Cancelados').doc (codigo).ref;
    batch.set (step_2, data);

    let step_4 = this.afs.collection ('Usuario_Cancelados').doc (id_old).collection ("Farmacia").doc (codigo).ref;
    batch.set (step_4, { 'id': codigo });

    let step_5 = this.afs.collection ('Admin_Canceladas').doc ("Farmacia").collection (moment().format('YYYY[-]MM')).doc (codigo).ref;
    batch.set (step_5, { 'id': codigo });
    
    return await batch.commit (); 
  }

  async updateDeliveryOnlinePaid (id: string, transaccion_id: string) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ("Farmacia_Proceso").doc (id).ref;
    batch.update (step_1, { 'is_paid': true, 
                            'state': 'completed',
                            'transaccion_id': transaccion_id,
                            'payment_type': 'online' });
    return await batch.commit ();
  }

  async updateDeliveryContraEntrega (id: string) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ("Farmacia_Proceso").doc (id).ref;

    batch.update (step_1, { 'is_paid': false, 
                            'state': 'completed',
                            'payment_type': 'cash' });

    return await batch.commit ();
  }

  getDeliveryByKey (id: string) {
    return this.afs.collection ("Farmacia_Proceso").doc (id).valueChanges ();
  }

  getFarmaciaFinalizadosByKey (id: string) {
    return this.afs.collection ("Farmacia_Finalizados").doc (id).valueChanges ();
  }

  getFarmaciaFinalizadosByUser (id: string) {
    const collection = this.afs.collection ("Usuario_Finalizados").doc (id).collection ("Farmacia");

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.getFarmaciaFinalizadosByKey (data.id).pipe (map (dataGeneral => Object.assign ({}, {data, dataGeneral})));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  getFarmaciaCanceladoByKey (id: string) {
    return this.afs.collection ("Farmacia_Cancelados").doc (id).valueChanges ();
  }

  getFarmaciaCanceladoByUser (id: string) {
    const collection = this.afs.collection ("Usuario_Cancelados").doc (id).collection ("Farmacia");

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.getFarmaciaCanceladoByKey (data.id).pipe (map (dataGeneral => Object.assign ({}, {data, dataGeneral})));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }
  // -----------------------------------------------------------------------------------------------------
  
  // Home Injection

  async addHomeInjection (id: string, data: any, extra: any) {
    let batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection('Inyecciones_Proceso').doc (id).ref;
    let step_2 = this.afs.collection('Users').doc (id).ref;

    batch.set (step_1, data);
    batch.update (step_2, {
      'country_code': extra.code,
      'country_dial_code': extra.dial_code,
      'country_name': extra.name,
      'phone_number': data.user_phone_number
    })
    
    await batch.commit ();

    return id;
  }

  async updateHomeInjection (id: string, data: any) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ("Inyecciones_Proceso").doc (id).ref;

    batch.update (step_1, data);
    
    return await batch.commit ();
  }

  getHomeInjection (id: string) {
    return this.afs.collection ('Inyecciones_Proceso').doc (id).valueChanges ();
  }

  getHomeInjectionByKey (id: string) {
    return this.afs.collection ("Inyecciones_Proceso").doc (id).valueChanges ();
  }

  getHomeInjectionObservations (id: string) {
    return this.afs.collection ('Inyecciones_Proceso').doc (id).collection ('observations', ref => ref.orderBy ('date')).valueChanges ();
  }

  async updateHomeInjectionCanceled (id: string, data: any, observations: any) {
    const id_old = data.id;
    const codigo = this.afs.createId ();
    data.id = codigo;

    var batch = this.afs.firestore.batch ();
    
    for (let item of observations) {
      let any_1 = this.afs.collection ('Inyecciones_Proceso').doc (id_old).collection ('observations').doc (item.id).ref;
      batch.delete (any_1);
      
      let any_2 = this.afs.collection ('Inyecciones_Canceladas').doc (codigo).collection ('observations').doc (item.id).ref;
      batch.set (any_2, item);
    }

    let step_1 = this.afs.collection ('Inyecciones_Proceso').doc (id_old).ref;
    batch.delete (step_1);

    let step_2 = this.afs.collection ('Inyecciones_Canceladas').doc (codigo).ref;
    batch.set (step_2, data);
 
    let step_4 = this.afs.collection ('Usuario_Cancelados').doc (id_old).collection ("Inyecciones").doc (codigo).ref;
    batch.set (step_4, { 'id': codigo });

    let step_5 = this.afs.collection ('Admin_Canceladas').doc ("Inyecciones").collection (moment().format('YYYY[-]MM')).doc (codigo).ref;
    batch.set (step_5, { 'id': codigo });
    
    return await batch.commit (); 
  }

  async updateHomeInjectionContraEntrega (id: string) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ("Inyecciones_Proceso").doc (id).ref;

    batch.update (step_1, { 'is_paid': false, 
                            'state': 'completed',
                            'payment_type': 'cash' });

    return await batch.commit ();
  }

  async updateHomeInjectionOnlinePaid (id: string, transaccion_id: string) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ("Inyecciones_Proceso").doc (id).ref;
    batch.update (step_1, { 'is_paid': true, 
                            'state': 'completed',
                            'transaccion_id': transaccion_id,
                            'payment_type': 'online' });
    return await batch.commit ();
  }

  getHomeInjectionFinalizadosByKey (id: string) {
    return this.afs.collection ("Inyecciones_Finalizadas").doc (id).valueChanges ();
  }

  getHomeInjectionFinalizadosByUser (id: string) {
    const collection = this.afs.collection ("Usuario_Finalizados").doc (id).collection ("Inyecciones");

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.getHomeInjectionFinalizadosByKey (data.id).pipe (map (dataGeneral => Object.assign ({}, {data, dataGeneral})));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  getHomeInjectionCanceladoByKey (id: string) {
    return this.afs.collection ("Inyecciones_Canceladas").doc (id).valueChanges ();
  }

  getHomeInjectionCanceladoByUser (id: string) {
    const collection = this.afs.collection ("Usuario_Cancelados").doc (id).collection ("Inyecciones");

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.getHomeInjectionCanceladoByKey (data.id).pipe (map (dataGeneral => Object.assign ({}, {data, dataGeneral})));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }
  // ------------------ CITAS ----------------------------------------------------------------------
  async addAppointment (id: string, data: any) {
    let codigo = this.afs.createId ();
   
    data.key = codigo;

    var batch = this.afs.firestore.batch ();

    let delivery = this.afs.collection('Appointments').doc (codigo).ref;
    let user_delivery = this.afs.collection('UsersAppointments').doc (id).collection ("Appointments").doc (codigo).ref;

    batch.set (delivery, data);
    batch.set (user_delivery, { "key" : codigo });

    await batch.commit ()

    return codigo;
  }

  getAppointmentByKey (key: string) {
    return this.afs.collection ("Appointments").doc (key).valueChanges ();
  }

  getAppointmentsByUser (id: string) {
    const collection = this.afs.collection ("UsersAppointments").doc (id).collection ("Appointments");

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.getAppointmentByKey (data.key).pipe (map (dataAppointment => Object.assign ({}, {data, dataAppointment})));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }
  
  // Transfer Ambulance 
  async addTransferAmbulance (id: string, data: any, extra: any) {
    let batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection('Transf_Ambulancia_Proceso').doc (id).ref;
    let step_2 = this.afs.collection('Users').doc (id).ref;

    batch.set (step_1, data);
    batch.update (step_2, {
      'country_code': extra.code,
      'country_dial_code': extra.dial_code,
      'country_name': extra.name,
      'phone_number': data.user_phone_number
    })
    
    await batch.commit ();
  }

  async updateTransferAmbulance (id: string, data: any) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ("Transf_Ambulancia_Proceso").doc (id).ref;

    batch.update (step_1, data);
    
    return await batch.commit ();
  }

  getTransferAmbulances (id: string) {
    const collection = this.afs.collection <any> ("UsersTransferAmbulances").doc (id).collection ("TransferAmbulances");

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.getTransferAmbulanceByKey (data.id).pipe (map (dataGeneral => Object.assign ({}, {data, dataGeneral})));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  getTransferAmbulanceByKey (id: string) {
    return this.afs.collection ("Transf_Ambulancia_Proceso").doc (id).valueChanges ();
  }

  async updateTransferAmbulanceOnlinePaid (id: string, transaccion_id: string) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ("Transf_Ambulancia_Proceso").doc (id).ref;
    batch.update (step_1, { 'is_paid': true, 
                            'state': 'completed',
                            'transaccion_id': transaccion_id,
                            'payment_type': 'online' });
    return await batch.commit ();
  }

  async updateTransferAmbulanceContraEntrega (id: string) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ("Transf_Ambulancia_Proceso").doc (id).ref;

    batch.update (step_1, { 'is_paid': false, 
                            'state': 'completed',
                            'payment_type': 'cash' });

    return await batch.commit ();
  }

  async updateTranferAmbulanceCanceled (id: string, data: any, observations: any) {
    const id_old = data.id;
    const codigo = this.afs.createId ();
    data.id = codigo;

    var batch = this.afs.firestore.batch ();
    
    for (let item of observations) {
      console.log (item.id);

      let any_1 = this.afs.collection ('Transf_Ambulancia_Proceso').doc (id_old).collection ('observations').doc (item.id).ref;
      batch.delete (any_1);
      
      let any_2 = this.afs.collection ('Transf_Ambulancia_Cancelados').doc (codigo).collection ('observations').doc (item.id).ref;
      batch.set (any_2, item);
    }

    let step_1 = this.afs.collection ('Transf_Ambulancia_Proceso').doc (id_old).ref;
    batch.delete (step_1);

    let step_2 = this.afs.collection ('Transf_Ambulancia_Cancelados').doc (codigo).ref;
    batch.set (step_2, data);

    let step_4 = this.afs.collection ('Usuario_Cancelados').doc (id_old).collection ("Transf_Ambulancia").doc (codigo).ref;
    batch.set (step_4, { 'id': codigo });

    let step_5 = this.afs.collection ('Admin_Canceladas').doc ("Transf_Ambulancia").collection (moment().format('YYYY[-]MM')).doc (codigo).ref;
    batch.set (step_5, { 'id': codigo });
    
    return await batch.commit (); 
  }

  getTransferAmbulanceFinalizadosByKey (id: string) {
    return this.afs.collection ("Transf_Ambulancia_Finalizados").doc (id).valueChanges ();
  }

  getTransferAmbulanceFinalizadosByUser (id: string) {
    const collection = this.afs.collection ("Usuario_Finalizados").doc (id).collection ("Transf_Ambulancia");

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.getTransferAmbulanceFinalizadosByKey (data.id).pipe (map (dataGeneral => Object.assign ({}, {data, dataGeneral})));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  getTransferAmbulanceCanceladoByKey (id: string) {
    return this.afs.collection ("Transf_Ambulancia_Cancelados").doc (id).valueChanges ();
  }

  getTransferAmbulanceCanceladoByUser (id: string) {
    const collection = this.afs.collection ("Usuario_Cancelados").doc (id).collection ("Transf_Ambulancia");

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.getTransferAmbulanceCanceladoByKey (data.id).pipe (map (dataGeneral => Object.assign ({}, {data, dataGeneral})));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  getTranferAmbulanceObservations (id: string) {
    return this.afs.collection ('Transf_Ambulancia_Proceso').doc (id).collection ('observations', ref => ref.orderBy ('date')).valueChanges ();
  }
  // --------------------------------------------------------------------------------------

  // Medical Escort 
  async addMedicalEscort (id: string, data: any, extra: any) {
    let batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection('Escolta_Medica_Proceso').doc (id).ref;
    let step_2 = this.afs.collection('Users').doc (id).ref;

    batch.set (step_1, data);
    batch.update (step_2, {
      'country_code': extra.code,
      'country_dial_code': extra.dial_code,
      'country_name': extra.name,
      'phone_number': data.user_phone_number
    })
    
    await batch.commit ();
  }


  getMedicalEscortByKey (id: string) {
    return this.afs.collection <any> ("Escolta_Medica_Proceso").doc (id).valueChanges ();
  }

  async updateMedicalEscorts (id: string, data: any) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ("Escolta_Medica_Proceso").doc (id).ref;

    batch.update (step_1, data);
    
    return await batch.commit ();
  }

  async updateMedicalEscortOnlinePaid (id: string, transaccion_id: any) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ("Escolta_Medica_Proceso").doc (id).ref;
    batch.update (step_1, { 'is_paid': true, 
                            'state': 'completed',
                            'transaccion_id': transaccion_id,
                            'payment_type': 'online' });
    return await batch.commit ();
  }

  async updateMedicalEscortContraEntrega (id: string) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ("Escolta_Medica_Proceso").doc (id).ref;

    batch.update (step_1, { 'is_paid': false, 
                            'state': 'completed',
                            'payment_type': 'cash' });

    return await batch.commit ();
  }
  
  async updateMedicalEscortsCanceled (id: string, data: any, observations: any) {
    const id_old = data.id;
    const codigo = this.afs.createId ();
    data.id = codigo;

    var batch = this.afs.firestore.batch ();
    
    for (let item of observations) {
      console.log (item.id);

      let any_1 = this.afs.collection ('Escolta_Medica_Proceso').doc (id_old).collection ('observations').doc (item.id).ref;
      batch.delete (any_1);
      
      let any_2 = this.afs.collection ('Escolta_Medica_Cancelados').doc (codigo).collection ('observations').doc (item.id).ref;
      batch.set (any_2, item);
    }

    let step_1 = this.afs.collection ('Escolta_Medica_Proceso').doc (id_old).ref;
    batch.delete (step_1);

    let step_2 = this.afs.collection ('Escolta_Medica_Cancelados').doc (codigo).ref;
    batch.set (step_2, data);

    let step_4 = this.afs.collection ('Usuario_Cancelados').doc (id_old).collection ("Escolta_Medica").doc (codigo).ref;
    batch.set (step_4, { 'id': codigo });

    let step_5 = this.afs.collection ('Admin_Canceladas').doc ("Escolta_Medica").collection (moment().format('YYYY[-]MM')).doc (codigo).ref;
    batch.set (step_5, { 'id': codigo });
    
    return await batch.commit (); 
  }

  getMedicalEscortsFinalizadosByKey (id: string) {
    return this.afs.collection ("Escolta_Medica_Finalizados").doc (id).valueChanges ();
  }

  getMedicalEscortsFinalizadosByUser (id: string) {
    const collection = this.afs.collection ("Usuario_Finalizados").doc (id).collection ("Escolta_Medica");

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.getMedicalEscortsFinalizadosByKey (data.id).pipe (map (dataGeneral => Object.assign ({}, {data, dataGeneral})));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  getMedicalEscortsCanceladoByKey (id: string) {
    return this.afs.collection ("Escolta_Medica_Cancelados").doc (id).valueChanges ();
  }

  getMedicalEscortsCanceladoByUser (id: string) {
    const collection = this.afs.collection ("Usuario_Cancelados").doc (id).collection ("Escolta_Medica");

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.getMedicalEscortsCanceladoByKey (data.id).pipe (map (dataGeneral => Object.assign ({}, {data, dataGeneral})));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }
  
  getMedicalEscortsObservations (id: string) {
    return this.afs.collection ('Escolta_Medica_Proceso').doc (id).collection ('observations', ref => ref.orderBy ('date')).valueChanges ();
  }

  // Presure Home
  async addHomePressure (id: string, data: any, extra: any) {
    let batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection('Presion_Casa_Proceso').doc (id).ref;
    let step_2 = this.afs.collection('Users').doc (id).ref;

    batch.set (step_1, data);
    batch.update (step_2, {
      'country_code': extra.code,
      'country_dial_code': extra.dial_code,
      'country_name': extra.name,
      'phone_number': data.user_phone_number
    })
    
    await batch.commit ();
  }

  getHomePressureByKey (id: string) {
    return this.afs.collection ("Presion_Casa_Proceso").doc (id).valueChanges ();
  }

  async updateHomePressure (id: string, data: any) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ("Presion_Casa_Proceso").doc (id).ref;

    batch.update (step_1, data);
    
    return await batch.commit ();
  }

  async updateHomePressureOnlinePaid (id: string, transaccion_id: any) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ("Presion_Casa_Proceso").doc (id).ref;
    batch.update (step_1, { 'is_paid': true, 
                            'state': 'completed',
                            'transaccion_id': transaccion_id,
                            'payment_type': 'online' });
    return await batch.commit ();
  }

  async updateHomePressureCanceled (id: string, data: any, observations: any) {
    const id_old = data.id;
    const codigo = this.afs.createId ();
    data.id = codigo;

    var batch = this.afs.firestore.batch ();
    
    for (let item of observations) {
      let any_1 = this.afs.collection ('Presion_Casa_Proceso').doc (id_old).collection ('observations').doc (item.id).ref;
      batch.delete (any_1);
      
      let any_2 = this.afs.collection ('Presion_Casa_Canceladas').doc (codigo).collection ('observations').doc (item.id).ref;
      batch.set (any_2, item);
    }

    let step_1 = this.afs.collection ('Presion_Casa_Proceso').doc (id_old).ref;
    batch.delete (step_1);

    let step_2 = this.afs.collection ('Presion_Casa_Canceladas').doc (codigo).ref;
    batch.set (step_2, data);

    let step_4 = this.afs.collection ('Usuario_Cancelados').doc (id_old).collection ("Presion_Casa").doc (codigo).ref;
    batch.set (step_4, { 'id': codigo });

    let step_5 = this.afs.collection ('Admin_Canceladas').doc ("Presion_Casa").collection (moment().format('YYYY[-]MM')).doc (codigo).ref;
    batch.set (step_5, { 'id': codigo });
    
    return await batch.commit (); 
  }

  async updateHomePressureContraEntrega (id: string) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ("Presion_Casa_Proceso").doc (id).ref;

    batch.update (step_1, { 'is_paid': false, 
                            'state': 'completed',
                            'payment_type': 'cash' });

    return await batch.commit ();
  }

  getHomePressureFinalizadosByKey (id: string) {
    return this.afs.collection ("Presion_Casa_Finalizadas").doc (id).valueChanges ();
  }

  getHomePressureFinalizadosByUser (id: string) {
    const collection = this.afs.collection ("Usuario_Finalizados").doc (id).collection ("Presion_Casa");

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.getHomePressureFinalizadosByKey (data.id).pipe (map (dataGeneral => Object.assign ({}, {data, dataGeneral})));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  getHomePressureCanceladoByKey (id: string) {
    return this.afs.collection ("Presion_Casa_Canceladas").doc (id).valueChanges ();
  }

  getHomePressureCanceladoByUser (id: string) {
    const collection = this.afs.collection ("Usuario_Cancelados").doc (id).collection ("Presion_Casa");

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.getHomePressureCanceladoByKey (data.id).pipe (map (dataGeneral => Object.assign ({}, {data, dataGeneral})));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  getHomePressureObservations (id: string) {
    return this.afs.collection ('Presion_Casa_Proceso').doc (id).collection ('observations', ref => ref.orderBy ('date')).valueChanges ();
  }

  // Home Doctor
  async addHomeDoctor (id: string, data: any, extra: any) {
    let batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection('Doctor_Casa_Proceso').doc (id).ref;
    let step_2 = this.afs.collection('Users').doc (id).ref;

    batch.set (step_1, data);
    batch.update (step_2, {
      'country_code': extra.code,
      'country_dial_code': extra.dial_code,
      'country_name': extra.name,
      'phone_number': data.user_phone_number
    })
    
    await batch.commit ();
  }

  getHomeDoctorByKey (id: string) {
    return this.afs.collection ("Doctor_Casa_Proceso").doc (id).valueChanges ();
  }

  async updateHomeDoctor (id: string, data: any) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ("Doctor_Casa_Proceso").doc (id).ref;

    batch.update (step_1, data);
    
    return await batch.commit ();
  }

  async updateHomeDoctorOnlinePaid (id: string, transaccion_id: any) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ("Doctor_Casa_Proceso").doc (id).ref;
    batch.update (step_1, { 'is_paid': true, 
                            'state': 'completed',
                            'transaccion_id': transaccion_id,
                            'payment_type': 'online' });
    return await batch.commit ();
  }

  async updateHomeDoctorCanceled (id: string, data: any, observations: any) {
    const id_old = data.id;
    const codigo = this.afs.createId ();
    data.id = codigo;

    var batch = this.afs.firestore.batch ();
    
    for (let item of observations) {
      let any_1 = this.afs.collection ('Doctor_Casa_Proceso').doc (id_old).collection ('observations').doc (item.id).ref;
      batch.delete (any_1);
      
      let any_2 = this.afs.collection ('Doctor_Casa_Cancelados').doc (codigo).collection ('observations').doc (item.id).ref;
      batch.set (any_2, item);
    }

    let step_1 = this.afs.collection ('Doctor_Casa_Proceso').doc (id_old).ref;
    batch.delete (step_1);

    let step_2 = this.afs.collection ('Doctor_Casa_Cancelados').doc (codigo).ref;
    batch.set (step_2, data);

    let step_4 = this.afs.collection ('Usuario_Cancelados').doc (id_old).collection ("Doctor_Casa").doc (codigo).ref;
    batch.set (step_4, { 'id': codigo });

    let step_5 = this.afs.collection ('Admin_Canceladas').doc ("Doctor_Casa").collection (moment().format('YYYY[-]MM')).doc (codigo).ref;
    batch.set (step_5, { 'id': codigo });
    
    return await batch.commit (); 
  }

  async updateHomeDoctorContraEntrega (id: string) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ("Doctor_Casa_Proceso").doc (id).ref;

    batch.update (step_1, { 'is_paid': false, 
                            'state': 'completed',
                            'payment_type': 'cash' });

    return await batch.commit ();
  }

  getHomeDoctorFinalizadosByKey (id: string) {
    return this.afs.collection ("Doctor_Casa_Finalizados").doc (id).valueChanges ();
  }

  getHomeDoctorFinalizadosByUser (id: string) {
    const collection = this.afs.collection ("Usuario_Finalizados").doc (id).collection ("Doctor_Casa");

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.getHomeDoctorFinalizadosByKey (data.id).pipe (map (dataGeneral => Object.assign ({}, {data, dataGeneral})));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  getHomeDoctorCanceladoByKey (id: string) {
    return this.afs.collection ("Doctor_Casa_Cancelados").doc (id).valueChanges ();
  }

  getHomeDoctorCanceladoByUser (id: string) {
    const collection = this.afs.collection ("Usuario_Cancelados").doc (id).collection ("Doctor_Casa");

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.getHomeDoctorCanceladoByKey (data.id).pipe (map (dataGeneral => Object.assign ({}, {data, dataGeneral})));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  getHomeDoctorObservations (id: string) {
    return this.afs.collection ('Doctor_Casa_Proceso').doc (id).collection ('observations', ref => ref.orderBy ('date')).valueChanges ();
  }


  // Request
  async addRequest (id: string, data: any, extra: any) {
    console.log (id);
    console.log (data);
    console.log (extra);

    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection('Solicitud_Proceso').doc (id).ref;
    let step_2 = this.afs.collection('Users').doc (id).ref;

    batch.set (step_1, data);
    batch.update (step_2, {
      'country_code': extra.code,
      'country_dial_code': extra.dial_code,
      'country_name': extra.name,
      'phone_number': data.user_phone_number
    })
    
    await batch.commit ();

    return id;
  }

  async updateRequest (id: string, data: any) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ("Solicitud_Proceso").doc (id).ref;

    batch.update (step_1, data);
    
    return await batch.commit ();
  }

  getRequestByKey (id: string) {
    return this.afs.collection ("Solicitud_Proceso").doc (id).valueChanges ();
  }

  getRequestObservations (id: string) {
    return this.afs.collection ('Solicitud_Proceso').doc (id).collection ('observations', ref => ref.orderBy ('date')).valueChanges ();
  }
  
  async updateRequestCanceled (id: string, data: any, observations: any) {
    const id_old = data.id;
    const codigo = this.afs.createId ();
    data.id = codigo;

    var batch = this.afs.firestore.batch ();
    
    for (let item of observations) {
      let any_1 = this.afs.collection ('Solicitud_Proceso').doc (id_old).collection ('observations').doc (item.id).ref;
      batch.delete (any_1);
      
      let any_2 = this.afs.collection ('Solicitud_Canceladas').doc (codigo).collection ('observations').doc (item.id).ref;
      batch.set (any_2, item);
    }

    let step_1 = this.afs.collection ('Solicitud_Proceso').doc (id_old).ref;
    batch.delete (step_1);

    let step_2 = this.afs.collection ('Solicitud_Canceladas').doc (codigo).ref;
    batch.set (step_2, data);

    let step_4 = this.afs.collection ('Usuario_Cancelados').doc (id_old).collection ("Solicitud").doc (codigo).ref;
    batch.set (step_4, { 'id': codigo });

    let step_5 = this.afs.collection ('Admin_Canceladas').doc ("Solicitud").collection (moment().format('YYYY[-]MM')).doc (codigo).ref;
    batch.set (step_5, { 'id': codigo });
    
    return await batch.commit (); 
  }

  async updateRequestContraEntrega (id: string) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ("Solicitud_Proceso").doc (id).ref;

    batch.update (step_1, { 'is_paid': false, 
                            'state': 'completed',
                            'payment_type': 'cash' });

    return await batch.commit ();
  }

  async updateRequestOnlinePaid (id: string, transaccion_id: string) {
    var batch = this.afs.firestore.batch ();

    let step_1 = this.afs.collection ("Solicitud_Proceso").doc (id).ref;
    batch.update (step_1, { 'is_paid': true, 
                            'state': 'completed',
                            'transaccion_id': transaccion_id,
                            'payment_type': 'online' });
    return await batch.commit ();
  }

  getRequestFinalizadosByKey (id: string) {
    return this.afs.collection ("Solicitud_Finalizadas").doc (id).valueChanges ();
  }

  getRequestFinalizadosByUser (id: string) {
    const collection = this.afs.collection ("Usuario_Finalizados").doc (id).collection ("Solicitud");

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.getRequestFinalizadosByKey (data.id).pipe (map (dataGeneral => Object.assign ({}, {data, dataGeneral})));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  getRequestCanceladoByKey (id: string) {
    return this.afs.collection ("Solicitud_Canceladas").doc (id).valueChanges ();
  }

  getRequestCanceladoByUser (id: string) {
    const collection = this.afs.collection ("Usuario_Cancelados").doc (id).collection ("Solicitud");

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();

          return this.getRequestCanceladoByKey (data.id).pipe (map (dataGeneral => Object.assign ({}, {data, dataGeneral})));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  getParaCalificar (id: string) {
    return this.afs.collection ('Users').doc (id).collection ('Para_Calificar').valueChanges ();
  }

  async addComentario (item: any, data: any, user_id: string) {
    var batch = this.afs.firestore.batch ();

    let node = "";

    if (item.type === 'delivery') {
      node = "Farmacia_Finalizados";
    } else if (item.type === 'injection') {
      node = "Inyecciones_Finalizadas";
    } else if (item.type === 'transfer') {
      node = "Transf_Ambulancia_Finalizados";
    } else if (item.type === 'medical') {
      node = "Escolta_Medica_Finalizados";
    } else if (item.type === 'home_pressure') {
      node = "Presion_Casa_Finalizadas";
    } else if (item.type === 'home_doctor') {
      node = "Doctor_Casa_Finalizados";
    } else if (item.type === 'request') {
      node = "Solicitud_Finalizadas";
    } 

    let step_1 = this.afs.collection (node).doc (item.id).ref;
    batch.update (step_1, {
      comment: data.comment,
      stars: data.stars
    });

    let step_2 = this.afs.collection ('Users').doc (user_id).collection ('Para_Calificar').doc (item.id).ref;
    batch.delete (step_2);

    let step_3 = this.afs.collection ('Calificaciones').doc (item.id).ref;
    batch.set (step_3, {
      id: item.id,
      type: item.type,
      comment: data.comment,
      stars: data.stars
    });

    return await batch.commit ();
  }

  cancelarComentario (item: any, user_id: string) {
    return this.afs.collection ('Users').doc (user_id).collection ('Para_Calificar').doc (item.id).delete ();
  }
}
