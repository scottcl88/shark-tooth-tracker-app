import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { Account } from '../_models';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor, OnDestroy {
    private readonly ngUnsubscribe = new Subject();
    public account: Account | null;

    constructor() { }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next(null);
        this.ngUnsubscribe.complete();
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if ([401, 403].includes(err.status) && this.account) {
                // auto logout if 401 or 403 response returned from api
                console.log("Error interceptor; is invalid");
            }

            const error = (err && err.error && err.error.message) || err.statusText;
            console.error(err);
            return throwError(error);
        }))
    }
}