import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmergencyPageRoutingModule } from './emergency-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { EmergencyPage } from './emergency.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmergencyPageRoutingModule,
    TranslateModule,
    ReactiveFormsModule
  ],
  declarations: [EmergencyPage]
})
export class EmergencyPageModule {}
