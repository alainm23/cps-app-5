import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeInjectionCheckPage } from './home-injection-check.page';

const routes: Routes = [
  {
    path: '',
    component: HomeInjectionCheckPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeInjectionCheckPageRoutingModule {}
