import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SendAmbulancePageRoutingModule } from './send-ambulance-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { SendAmbulancePage } from './send-ambulance.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SendAmbulancePageRoutingModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [SendAmbulancePage]
})
export class SendAmbulancePageModule {}
