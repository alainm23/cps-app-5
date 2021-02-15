import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { FormularioAntiFraudePageRoutingModule } from './formulario-anti-fraude-routing.module';
import { FormularioAntiFraudePage } from './formulario-anti-fraude.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormularioAntiFraudePageRoutingModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [FormularioAntiFraudePage]
})
export class FormularioAntiFraudePageModule {}
