/**
Copyright 2025 Scott Lewis, All rights reserved.
**/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalSignInEncouragementPage } from './modal-signin-encouragement.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [ModalSignInEncouragementPage],
  exports: [ModalSignInEncouragementPage]
})
export class ModalSignInEncouragementPageModule {}
