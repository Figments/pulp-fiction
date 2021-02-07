import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { FrontendUser } from '@dragonfish/models/users';
import { Select } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { UserState } from '../../../../shared/user';

import { NetworkService } from '../../../../services';
import { Collection } from '@dragonfish/models/collections';

@Injectable()
export class CollectionPageResolver implements Resolve<Collection> {
    @Select(UserState.currUser) currentUser$: Observable<FrontendUser>;
    currentUserSubscription: Subscription;
    currentUser: FrontendUser;

    constructor(private networkService: NetworkService) {
        this.currentUserSubscription = this.currentUser$.subscribe((x) => {
            this.currentUser = x;
        });
    }

    resolve(route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot): Observable<Collection> {
        const userId = route.parent.paramMap.get('id');
        const collectionId = route.paramMap.get('collId');

        if (this.currentUser) {
            if (this.currentUser._id === userId) {
                return this.networkService.fetchOneCollection(collectionId);
            } else {
                return this.networkService.fetchOnePublicCollection(userId, collectionId);
            }
        } else {
            return this.networkService.fetchOnePublicCollection(userId, collectionId);
        }
    }
}
