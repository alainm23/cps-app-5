import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeInjectionPage } from './home-injection.page';

const routes: Routes = [
  {
    path: '',
    component: HomeInjectionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeInjectionPageRoutingModule {}
