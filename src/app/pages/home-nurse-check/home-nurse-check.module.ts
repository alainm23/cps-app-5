import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeNurseCheckPageRoutingModule } from './home-nurse-check-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { HomeNurseCheckPage } from './home-nurse-check.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeNurseCheckPageRoutingModule,
    TranslateModule,
    ReactiveFormsModule
  ],
  declarations: [HomeNurseCheckPage]
})
export class HomeNurseCheckPageModule {}
