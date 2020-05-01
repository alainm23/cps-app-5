import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MedicalEscortCheckPageRoutingModule } from './medical-escort-check-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { MedicalEscortCheckPage } from './medical-escort-check.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MedicalEscortCheckPageRoutingModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [MedicalEscortCheckPage]
})
export class MedicalEscortCheckPageModule {}
