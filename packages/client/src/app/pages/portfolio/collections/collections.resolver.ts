import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Select } from '@ngxs/store';

import { FrontendUser } from '@dragonfish/models/users';
import { PaginateResult } from '@dragonfish/models/util';
import { Collection } from '@dragonfish/models/collections';

import { UserState } from '../../../shared/user';
import { NetworkService } from '../../../services';

@Injectable()
export class CollectionsResolver implements Resolve<PaginateResult<Collection>> {
    @Select(UserState.currUser) currentUser$: Observable<FrontendUser>;
    currentUserSubscription: Subscription;
    currentUser: FrontendUser;

    pageNum: number = 1;

    constructor(private networkService: NetworkService) {
        this.currentUserSubscription = this.currentUser$.subscribe((x) => {
            this.currentUser = x;
        });
    }

    resolve(route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot): Observable<PaginateResult<Collection>> {
        const userId = route.parent.paramMap.get('id');
        const pageNum = +route.queryParamMap.get('page');

        if (pageNum) {
            this.pageNum = pageNum;
        }

        if (this.currentUser) {
            if (this.currentUser._id === userId) {
                return this.networkService.fetchAllCollections(this.pageNum);
            } else {
                return this.networkService.fetchPublicCollections(userId, this.pageNum);
            }
        } else {
            return this.networkService.fetchPublicCollections(userId, this.pageNum);
        }
    }
}
