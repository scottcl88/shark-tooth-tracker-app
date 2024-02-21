import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { from, Observable, Subject } from 'rxjs';

import { environment } from '../../environments/environment';
import { StorageService } from '../storage.service';
import { takeUntil } from 'rxjs/operators';
import { Account } from '../_models';

@Injectable()
export class JwtInterceptor implements HttpInterceptor, OnDestroy {
    private ngUnsubscribe = new Subject();
    public account: Account | null;

    constructor(private storageService: StorageService) {
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
        return next.handle(request).toPromise();
    }
}