import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MedicalEscortPageRoutingModule } from './medical-escort-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { MedicalEscortPage } from './medical-escort.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MedicalEscortPageRoutingModule,
    TranslateModule,
    ReactiveFormsModule
  ],
  declarations: [MedicalEscortPage]
})
export class MedicalEscortPageModule {}
