import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'legal',
    loadChildren: () => import('./legal/legal.module').then(m => m.LegalPageModule)
  },
  {
    path: 'terms-of-use',
    loadChildren: () => import('./terms/terms.module').then(m => m.TermsPageModule)
  },
  {
    path: 'privacy-policy',
    loadChildren: () => import('./privacy-policy/privacy-policy.module').then(m => m.PrivacyPolicyPageModule)
  },
  {
    path: 'cookie-policy',
    loadChildren: () => import('./cookie-policy/cookie-policy.module').then(m => m.CookiePolicyPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule)
  },
  {
    path: 'data',
    loadChildren: () => import('./data/data.module').then(m => m.DataPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
