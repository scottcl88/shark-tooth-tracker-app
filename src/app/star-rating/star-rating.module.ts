/**
Copyright 2024 Scott Lewis, All rights reserved.
**/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StarRatingComponent } from './star-rating.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [StarRatingComponent],
  exports: [StarRatingComponent]
})
export class StarRatingModule { }
