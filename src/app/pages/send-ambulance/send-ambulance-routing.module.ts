import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SendAmbulancePage } from './send-ambulance.page';

const routes: Routes = [
  {
    path: '',
    component: SendAmbulancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SendAmbulancePageRoutingModule {}
