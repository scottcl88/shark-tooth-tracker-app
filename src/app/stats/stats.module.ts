/**
Copyright 2025 Scott Lewis, All rights reserved.
**/
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StatsPageRoutingModule } from './stats-routing.module';

import { StatsPage } from './stats.page';
import { HeaderModule } from '../header/header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,    
    ReactiveFormsModule,
    StatsPageRoutingModule,
    HeaderModule
  ],
  declarations: [StatsPage],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class StatsPageModule {}
