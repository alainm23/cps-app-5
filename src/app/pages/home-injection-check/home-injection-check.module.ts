import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeInjectionCheckPageRoutingModule } from './home-injection-check-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { HomeInjectionCheckPage } from './home-injection-check.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeInjectionCheckPageRoutingModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [HomeInjectionCheckPage]
})
export class HomeInjectionCheckPageModule {}
