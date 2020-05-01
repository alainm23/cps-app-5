import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppointmentCheckoutPageRoutingModule } from './appointment-checkout-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { AppointmentCheckoutPage } from './appointment-checkout.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppointmentCheckoutPageRoutingModule,
    TranslateModule,
    ReactiveFormsModule
  ],
  declarations: [AppointmentCheckoutPage]
})
export class AppointmentCheckoutPageModule {}
