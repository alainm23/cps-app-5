import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfirmAmbulancePage } from './confirm-ambulance.page';

const routes: Routes = [
  {
    path: '',
    component: ConfirmAmbulancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfirmAmbulancePageRoutingModule {}
