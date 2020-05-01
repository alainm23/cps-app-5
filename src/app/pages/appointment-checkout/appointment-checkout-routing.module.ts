import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppointmentCheckoutPage } from './appointment-checkout.page';

const routes: Routes = [
  {
    path: '',
    component: AppointmentCheckoutPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppointmentCheckoutPageRoutingModule {}
