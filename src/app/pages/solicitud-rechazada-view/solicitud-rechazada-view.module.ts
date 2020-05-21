import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SolicitudRechazadaViewPageRoutingModule } from './solicitud-rechazada-view-routing.module';

import { SolicitudRechazadaViewPage } from './solicitud-rechazada-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SolicitudRechazadaViewPageRoutingModule
  ],
  declarations: [SolicitudRechazadaViewPage]
})
export class SolicitudRechazadaViewPageModule {}
