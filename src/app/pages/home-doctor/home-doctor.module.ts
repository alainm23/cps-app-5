import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeDoctorPageRoutingModule } from './home-doctor-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { HomeDoctorPage } from './home-doctor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeDoctorPageRoutingModule,
    TranslateModule,
    ReactiveFormsModule
  ],
  declarations: [HomeDoctorPage]
})
export class HomeDoctorPageModule {}
