import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeDoctorCheckPageRoutingModule } from './home-doctor-check-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { HomeDoctorCheckPage } from './home-doctor-check.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeDoctorCheckPageRoutingModule,
    TranslateModule,
    ReactiveFormsModule
  ],
  declarations: [HomeDoctorCheckPage]
})
export class HomeDoctorCheckPageModule {}
