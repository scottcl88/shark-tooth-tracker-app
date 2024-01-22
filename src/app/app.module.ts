import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IonicStorageModule } from '@ionic/storage-angular';
import cordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { Drivers, Storage } from '@ionic/storage';
import { ModalSignInPageModule } from './modal-signin/modal-signin.module';
import { CommonModule } from '@angular/common';
import { StorageService } from './storage.service';
import { FirebaseAuthService } from 'src/firebaseAuth.service';
import { LoggerService } from './logger.service';
import { appInitializer } from './_helpers';
import { DateFnsModule } from 'ngx-date-fns';
import { GeocodeService } from './geocode.service';
import { HttpClientModule } from '@angular/common/http';
import { CollectionService } from './collection.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),    
    DateFnsModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    IonicStorageModule.forRoot({
      driverOrder: [cordovaSQLiteDriver._driver, Drivers.IndexedDB, Drivers.LocalStorage]
    }),    
    CommonModule,
    ModalSignInPageModule,    
    RouterModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [StorageService, FirebaseAuthService, CollectionService, LoggerService, GeocodeService] },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
