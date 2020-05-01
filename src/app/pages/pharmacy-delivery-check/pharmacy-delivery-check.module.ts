import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PharmacyDeliveryCheckPageRoutingModule } from './pharmacy-delivery-check-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { PharmacyDeliveryCheckPage } from './pharmacy-delivery-check.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PharmacyDeliveryCheckPageRoutingModule,
    TranslateModule,
    ReactiveFormsModule
  ],
  declarations: [PharmacyDeliveryCheckPage]
})
export class PharmacyDeliveryCheckPageModule {}
