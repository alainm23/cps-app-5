import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RequestResultsCheckPageRoutingModule } from './request-results-check-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { RequestResultsCheckPage } from './request-results-check.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RequestResultsCheckPageRoutingModule,
    TranslateModule
  ],
  declarations: [RequestResultsCheckPage]
})
export class RequestResultsCheckPageModule {}
