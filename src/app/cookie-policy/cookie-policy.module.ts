/**
Copyright 2024 Scott Lewis, All rights reserved.
**/
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CookiePolicyPageRoutingModule } from './cookie-policy-routing.module';

import { CookiePolicyPage } from './cookie-policy.page';
import { HeaderModule } from '../header/header.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,    
    ReactiveFormsModule,
    CookiePolicyPageRoutingModule,
    HeaderModule,
    PdfViewerModule
  ],
  declarations: [CookiePolicyPage],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class CookiePolicyPageModule {}
