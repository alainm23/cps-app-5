import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppointmentSpecialtyPageRoutingModule } from './appointment-specialty-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { AppointmentSpecialtyPage } from './appointment-specialty.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppointmentSpecialtyPageRoutingModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [AppointmentSpecialtyPage]
})
export class AppointmentSpecialtyPageModule {}
