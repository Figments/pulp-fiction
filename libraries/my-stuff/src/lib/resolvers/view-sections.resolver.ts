import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { ContentModel } from '@dragonfish/models/content';
import { MyStuffState } from '../shared';
import { Sections } from '../shared/sections';

@Injectable()
export class ViewSectionsResolver implements Resolve<void> {
    @SelectSnapshot(MyStuffState.currContent) currContent: ContentModel | null;
    constructor(private store: Store) {}

    resolve(route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot): Observable<void> {
        return this.store.dispatch(new Sections.SetAll(this.currContent._id));
    }
}
