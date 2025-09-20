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
import { ModalSignInEncouragementPageModule } from './modal-signin-encouragement/modal-signin-encouragement.module';
import { CommonModule } from '@angular/common';
import { StorageService } from './storage.service';
import { FirebaseAuthService } from 'src/firebaseAuth.service';
import { LoggerService } from './logger.service';
import { appInitializer } from './_helpers';
import { DateFnsModule } from 'ngx-date-fns';
import { GeocodeService } from './geocode.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CollectionService } from './collection.service';
import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete';
import { ModalViewToothPageModule } from './modal-view-tooth/modal-view-tooth.module';
import { FirestoreService } from 'src/firestore.service';

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent], imports: [
    BrowserModule,
    IonicModule.forRoot({ innerHTMLTemplatesEnabled: true }),
    DateFnsModule.forRoot(),
    AppRoutingModule,
    NgxGpAutocompleteModule,
    IonicStorageModule.forRoot({
      driverOrder: [cordovaSQLiteDriver._driver, Drivers.IndexedDB, Drivers.LocalStorage]
    }),
    CommonModule,
    RouterModule,
    ModalSignInPageModule,
    ModalSignInEncouragementPageModule,
    ModalViewToothPageModule,
    NgxGpAutocompleteModule.forRoot({
      loaderOptions: {
        apiKey: 'AIzaSyBRDTBIiPMYYBvp6bIOsPXf-Id9uXkLh4M',
        libraries: ['places']
      }
    })
  ], providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [StorageService, FirebaseAuthService, FirestoreService, CollectionService, LoggerService, GeocodeService] },
    provideHttpClient(withInterceptorsFromDi()),
  ]
})
export class AppModule { }
