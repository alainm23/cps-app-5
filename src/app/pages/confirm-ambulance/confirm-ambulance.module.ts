import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfirmAmbulancePageRoutingModule } from './confirm-ambulance-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmAmbulancePage } from './confirm-ambulance.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfirmAmbulancePageRoutingModule,
    TranslateModule
  ],
  declarations: [ConfirmAmbulancePage]
})
export class ConfirmAmbulancePageModule {}
