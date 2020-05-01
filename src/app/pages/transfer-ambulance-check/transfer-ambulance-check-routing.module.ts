import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferAmbulanceCheckPage } from './transfer-ambulance-check.page';

const routes: Routes = [
  {
    path: '',
    component: TransferAmbulanceCheckPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferAmbulanceCheckPageRoutingModule {}
