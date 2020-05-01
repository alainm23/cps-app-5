import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PharmacyDeliveryPage } from './pharmacy-delivery.page';

const routes: Routes = [
  {
    path: '',
    component: PharmacyDeliveryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PharmacyDeliveryPageRoutingModule {}
