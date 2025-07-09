/**
Copyright 2025 Scott Lewis, All rights reserved.
**/
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { ModalRatingRoutingModule } from './results-routing.module';

import { ModalFeedbackPage } from './modal-feedback.page';
import { HeaderModule } from '../header/header.module';
import { StarRatingModule } from '../star-rating/star-rating.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderModule,
    StarRatingModule
  ],
  declarations: [ModalFeedbackPage],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class ModalFeedbackPageModule {}
