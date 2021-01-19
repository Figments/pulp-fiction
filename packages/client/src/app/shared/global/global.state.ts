import { Injectable } from '@angular/core';
import { State, Action, Selector, StateContext } from '@ngxs/store';
import { from, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GlobalService } from './services';
import { GlobalStateModel } from './global-state.model';
import { Global } from './global.actions';

import { ContentFilter } from '@pulp-fiction/models/content';

@State<GlobalStateModel>({
    name: 'global',
    defaults: {
        filter: ContentFilter.Default
    }
})
@Injectable()
export class GlobalState {
    constructor (private globalService: GlobalService) {}

    /* Actions */

    @Action(Global.SetContentFilter)
    async setContentFilter({ patchState }: StateContext<GlobalStateModel>, action: Global.SetContentFilter) {
        return await this.globalService.setContentFilter(action.enableMature, action.enableExplicit).then(filter => {
            patchState({
                filter: filter
            });
        });
    }
}