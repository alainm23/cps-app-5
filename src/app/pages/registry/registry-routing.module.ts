import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistryPage } from './registry.page';

const routes: Routes = [
  {
    path: '',
    component: RegistryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistryPageRoutingModule {}
