import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapSelectPageRoutingModule } from './map-select-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { MapSelectPage } from './map-select.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapSelectPageRoutingModule,
    TranslateModule
  ],
  declarations: [MapSelectPage]
})
export class MapSelectPageModule {}
