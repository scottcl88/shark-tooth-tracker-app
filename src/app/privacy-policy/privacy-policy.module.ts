/**
Copyright 2024 Scott Lewis, All rights reserved.
**/
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PrivacyPolicyPageRoutingModule } from './privacy-policy-routing.module';

import { PrivacyPolicyPage } from './privacy-policy.page';
import { HeaderModule } from '../header/header.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,    
    ReactiveFormsModule,
    PrivacyPolicyPageRoutingModule,
    HeaderModule,
    PdfViewerModule
  ],
  declarations: [PrivacyPolicyPage],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class PrivacyPolicyPageModule {}
