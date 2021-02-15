import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormularioAntiFraudePage } from './formulario-anti-fraude.page';

const routes: Routes = [
  {
    path: '',
    component: FormularioAntiFraudePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormularioAntiFraudePageRoutingModule {}
