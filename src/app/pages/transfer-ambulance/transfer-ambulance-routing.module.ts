import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferAmbulancePage } from './transfer-ambulance.page';

const routes: Routes = [
  {
    path: '',
    component: TransferAmbulancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferAmbulancePageRoutingModule {}
