import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private storage: Storage) {

  }

  setValue (key: string, value) {
    this.storage.set (key, value);
  }

  getValue (key: string) {
    return this.storage.get (key);
  }
}
