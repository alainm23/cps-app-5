import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeNursePage } from './home-nurse.page';

const routes: Routes = [
  {
    path: '',
    component: HomeNursePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeNursePageRoutingModule {}
