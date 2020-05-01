import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PaisesCodsPageRoutingModule } from './paises-cods-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { PaisesCodsPage } from './paises-cods.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PaisesCodsPageRoutingModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [PaisesCodsPage]
})
export class PaisesCodsPageModule {}
