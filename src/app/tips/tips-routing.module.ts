/**
Copyright 2023 Scott Lewis, All rights reserved.
**/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TipsPage } from './tips.page';

const routes: Routes = [
  {
    path: '',
    component: TipsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TipsPageRoutingModule {}
