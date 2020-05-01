import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MedicalEscortPage } from './medical-escort.page';

const routes: Routes = [
  {
    path: '',
    component: MedicalEscortPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MedicalEscortPageRoutingModule {}
