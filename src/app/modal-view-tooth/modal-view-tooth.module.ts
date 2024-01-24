/**
Copyright 2024 Scott Lewis, All rights reserved.
**/
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { ModalRatingRoutingModule } from './results-routing.module';

import { ModalViewToothPage } from './modal-view-tooth.page';
import { HeaderModule } from '../header/header.module';
import { DateFnsModule } from 'ngx-date-fns';
import { ModalMapPageModule } from '../modal-map/modal-map.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderModule,    
    DateFnsModule,
    ModalMapPageModule,
    
  ],
  declarations: [ModalViewToothPage],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class ModalViewToothPageModule {}
