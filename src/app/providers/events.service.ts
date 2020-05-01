import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private fooSubject = new Subject<any> ();
  private fooIdioma = new Subject<any> ();
  private deslogeado = new Subject<any> ();
  constructor () { }

  publishSomeData (data: any) {
    this.fooSubject.next (data);
  }

  getObservable (): Subject<any> {
    return this.fooSubject;
  }

  publishIdioma (data: any) {
    this.fooIdioma.next (data);
  }

  getIdiomaObservable (): Subject<any> {
    return this.fooIdioma;
  }

  publishDeslogeado (data: any) {
    this.deslogeado.next (data);
  }

  getObservableDeslogeado (): Subject<any> {
    return this.deslogeado;
  }
}
