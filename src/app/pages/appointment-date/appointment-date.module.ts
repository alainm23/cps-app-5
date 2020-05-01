import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppointmentDatePageRoutingModule } from './appointment-date-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { AppointmentDatePage } from './appointment-date.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppointmentDatePageRoutingModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [AppointmentDatePage]
})
export class AppointmentDatePageModule {}
