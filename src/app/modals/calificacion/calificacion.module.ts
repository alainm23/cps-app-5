import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CalificacionPageRoutingModule } from './calificacion-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { CalificacionPage } from './calificacion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalificacionPageRoutingModule,
    TranslateModule
  ],
  declarations: [CalificacionPage]
})
export class CalificacionPageModule {}
