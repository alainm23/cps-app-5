import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeInjectionPageRoutingModule } from './home-injection-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { HomeInjectionPage } from './home-injection.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeInjectionPageRoutingModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [HomeInjectionPage]
})
export class HomeInjectionPageModule {}
