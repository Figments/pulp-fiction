import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngxs/store';
import { ContentKind, ContentModel } from '@pulp-fiction/models/content';
import { PaginateResult } from '@pulp-fiction/models/util';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Content, ContentState } from '../../../shared/content';

@Injectable()
export class BlogsResolver implements Resolve<PaginateResult<ContentModel>> {
    pageNum: number = 1;

    constructor (private store: Store) {}

    resolve(route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot): Observable<PaginateResult<ContentModel>> {
        const userId = route.parent.paramMap.get('id');
        const pageNum = +route.queryParamMap.get('page');

        if (pageNum) {
            this.pageNum = pageNum;
        }

        return this.store.dispatch(new Content.FetchAll(this.pageNum, [ContentKind.BlogContent], userId)).pipe(switchMap(() => {
            return this.store.selectOnce<PaginateResult<ContentModel>>(ContentState.currPageContent)
        }));
    }
}