import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppointmentHistoryPage } from './appointment-history.page';

const routes: Routes = [
  {
    path: '',
    component: AppointmentHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppointmentHistoryPageRoutingModule {}
