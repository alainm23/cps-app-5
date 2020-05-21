import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolicitudRechazadaViewPage } from './solicitud-rechazada-view.page';

const routes: Routes = [
  {
    path: '',
    component: SolicitudRechazadaViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolicitudRechazadaViewPageRoutingModule {}
