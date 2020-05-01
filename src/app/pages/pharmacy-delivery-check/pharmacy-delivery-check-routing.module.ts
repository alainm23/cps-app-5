import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PharmacyDeliveryCheckPage } from './pharmacy-delivery-check.page';

const routes: Routes = [
  {
    path: '',
    component: PharmacyDeliveryCheckPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PharmacyDeliveryCheckPageRoutingModule {}
