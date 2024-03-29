/**
Copyright 2024 Scott Lewis, All rights reserved.
**/
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TermsPageRoutingModule } from './terms-routing.module';

import { TermsPage } from './terms.page';
import { HeaderModule } from '../header/header.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,    
    ReactiveFormsModule,
    TermsPageRoutingModule,
    HeaderModule,
    PdfViewerModule
  ],
  declarations: [TermsPage],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class TermsPageModule {}
