import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppointmentHistoryPageRoutingModule } from './appointment-history-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { AppointmentHistoryPage } from './appointment-history.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppointmentHistoryPageRoutingModule,
    TranslateModule
  ],
  declarations: [AppointmentHistoryPage]
})
export class AppointmentHistoryPageModule {}
