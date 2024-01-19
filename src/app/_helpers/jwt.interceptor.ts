import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { from, Observable, Subject } from 'rxjs';

import { environment } from '../../environments/environment';
import { StorageService } from '../storage.service';
import { takeUntil } from 'rxjs/operators';
import { Account } from '../_models';

@Injectable()
export class JwtInterceptor implements HttpInterceptor, OnInit, OnDestroy {
    private ngUnsubscribe = new Subject();
    public account: Account | null;

    constructor(private storageService: StorageService) {
        this.ngOnInit();
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next(null);
        this.ngUnsubscribe.complete();
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // convert promise to observable using 'from' operator
        return from(this.handle(request, next)) as any
    }

    async handle(request: HttpRequest<any>, next: HttpHandler) {
        // let storageAccount = await this.storageService.getAccount();
        // // add auth header with jwt if account is logged in and request is to the api url
        // const isLoggedIn = this.account && this.account.token;
        // const isStorageLoggedIn = storageAccount && storageAccount.token;
        // const isApiUrl = request.url.startsWith(environment.API_BASE_URL);
        // if (isLoggedIn && isApiUrl) {
        //     request = request.clone({
        //         setHeaders: { Authorization: `Bearer ${this.account?.token}` }, withCredentials: true
        //     });
        // } else if (isStorageLoggedIn && isApiUrl) {
        //     //might be first time app is opened, accountService is null so use storage
        //     request = request.clone({
        //         setHeaders: { Authorization: `Bearer ${storageAccount.token}` }, withCredentials: true
        //     });
        // }
        return next.handle(request).toPromise();
    }
}