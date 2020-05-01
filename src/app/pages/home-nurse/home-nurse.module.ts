import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeNursePageRoutingModule } from './home-nurse-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { HomeNursePage } from './home-nurse.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeNursePageRoutingModule,
    TranslateModule,
    ReactiveFormsModule
  ],
  declarations: [HomeNursePage]
})
export class HomeNursePageModule {}
