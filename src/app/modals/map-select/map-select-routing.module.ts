import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MapSelectPage } from './map-select.page';

const routes: Routes = [
  {
    path: '',
    component: MapSelectPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapSelectPageRoutingModule {}
