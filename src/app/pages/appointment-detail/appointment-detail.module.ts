import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppointmentDetailPageRoutingModule } from './appointment-detail-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { AppointmentDetailPage } from './appointment-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppointmentDetailPageRoutingModule,
    TranslateModule
  ],
  declarations: [AppointmentDetailPage]
})
export class AppointmentDetailPageModule {}
