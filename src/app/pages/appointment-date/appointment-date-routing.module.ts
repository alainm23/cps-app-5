import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppointmentDatePage } from './appointment-date.page';

const routes: Routes = [
  {
    path: '',
    component: AppointmentDatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppointmentDatePageRoutingModule {}
