/**
Copyright 2024 Scott Lewis, All rights reserved.
**/
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalMapPage } from './modal-map.page';
import { HeaderModule } from '../header/header.module';
import { GoogleMapsModule } from '@angular/google-maps';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderModule,
    GoogleMapsModule
  ],
  declarations: [ModalMapPage],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class ModalMapPageModule {}
