import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaisesCodsPage } from './paises-cods.page';

const routes: Routes = [
  {
    path: '',
    component: PaisesCodsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaisesCodsPageRoutingModule {}
