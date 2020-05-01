import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RequestResultsPageRoutingModule } from './request-results-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { RequestResultsPage } from './request-results.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RequestResultsPageRoutingModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [RequestResultsPage]
})
export class RequestResultsPageModule {}
