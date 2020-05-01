import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RequestResultsPage } from './request-results.page';

const routes: Routes = [
  {
    path: '',
    component: RequestResultsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RequestResultsPageRoutingModule {}
