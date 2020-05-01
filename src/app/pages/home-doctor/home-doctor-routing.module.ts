import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeDoctorPage } from './home-doctor.page';

const routes: Routes = [
  {
    path: '',
    component: HomeDoctorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeDoctorPageRoutingModule {}
