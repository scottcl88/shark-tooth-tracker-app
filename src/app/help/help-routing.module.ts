/**
Copyright 2024 Scott Lewis, All rights reserved.
**/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HelpPage } from './help.page';

const routes: Routes = [
  {
    path: '',
    component: HelpPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HelpPageRoutingModule {}
