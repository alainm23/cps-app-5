import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistryPageRoutingModule } from './registry-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { RegistryPage } from './registry.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistryPageRoutingModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [RegistryPage]
})
export class RegistryPageModule {}
