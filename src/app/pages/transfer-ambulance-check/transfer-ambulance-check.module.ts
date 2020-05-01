import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferAmbulanceCheckPageRoutingModule } from './transfer-ambulance-check-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { TransferAmbulanceCheckPage } from './transfer-ambulance-check.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferAmbulanceCheckPageRoutingModule,
    TranslateModule,
    ReactiveFormsModule
  ],
  declarations: [TransferAmbulanceCheckPage]
})
export class TransferAmbulanceCheckPageModule {}
