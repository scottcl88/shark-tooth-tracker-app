import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { HomePageRoutingModule } from './home-routing.module';
import { DateFnsModule } from 'ngx-date-fns';
import { ModalFeedbackPageModule } from '../modal-feedback/modal-feedback.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HomePageRoutingModule,
    DateFnsModule,
    ModalFeedbackPageModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
