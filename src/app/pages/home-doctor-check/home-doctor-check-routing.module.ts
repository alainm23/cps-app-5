import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeDoctorCheckPage } from './home-doctor-check.page';

const routes: Routes = [
  {
    path: '',
    component: HomeDoctorCheckPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeDoctorCheckPageRoutingModule {}
