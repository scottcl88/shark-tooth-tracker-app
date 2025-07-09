/**
Copyright 2025 Scott Lewis, All rights reserved.
**/
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DataPageRoutingModule } from './data-routing.module';

import { DataPage } from './data.page';
import { HeaderModule } from '../header/header.module';
import { ModalEmailPageModule } from '../modal-email/modal-email.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,    
    ReactiveFormsModule,
    DataPageRoutingModule,
    HeaderModule,
    ModalEmailPageModule
  ],
  declarations: [DataPage],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class DataPageModule {}
