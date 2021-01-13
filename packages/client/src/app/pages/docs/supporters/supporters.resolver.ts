import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, zip, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Work } from '@pulp-fiction/models/works';
import { Blog } from '@pulp-fiction/models/blogs';
import { FrontendUser } from '@pulp-fiction/models/users';

@Injectable()
export class SupportersResolver implements Resolve<FrontendUser[]> {
    private url = `/api/admin`;

    constructor(private http: HttpClient) {}

    resolve(route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot): Observable<FrontendUser[]> {
        return this.getSupporters();
    }

    getSupporters() {
        return this.http.get<FrontendUser[]>(`${this.url}/supporters`, {observe: 'response', withCredentials: true})
            .pipe(map(res => {
                return res.body;
            }), catchError(err => {
                return throwError(err);
            }));
    }
}