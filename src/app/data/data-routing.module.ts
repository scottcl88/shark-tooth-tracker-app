/**
Copyright 2024 Scott Lewis, All rights reserved.
**/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DataPage } from './data.page';

const routes: Routes = [
  {
    path: '',
    component: DataPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DataPageRoutingModule {}
