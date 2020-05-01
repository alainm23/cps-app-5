import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PharmacyDeliveryPageRoutingModule } from './pharmacy-delivery-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { PharmacyDeliveryPage } from './pharmacy-delivery.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PharmacyDeliveryPageRoutingModule,
    TranslateModule,
    ReactiveFormsModule
  ],
  declarations: [PharmacyDeliveryPage]
})
export class PharmacyDeliveryPageModule {}
