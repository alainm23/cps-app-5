import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferAmbulancePageRoutingModule } from './transfer-ambulance-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { TransferAmbulancePage } from './transfer-ambulance.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferAmbulancePageRoutingModule,
    TranslateModule,
    ReactiveFormsModule
  ],
  declarations: [TransferAmbulancePage]
})
export class TransferAmbulancePageModule {}
