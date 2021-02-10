import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { PaginateResult } from '@dragonfish/models/util';
import { NetworkService } from '../../services';
import { ReadingHistory } from '@dragonfish/models/reading-history';

@Injectable()
export class HistoryResolver implements Resolve<PaginateResult<ReadingHistory>> {
    pageNum: number = 1;

    constructor(private networkService: NetworkService) {}

    resolve(
        route: ActivatedRouteSnapshot,
        routerState: RouterStateSnapshot,
    ): Observable<PaginateResult<ReadingHistory>> {
        const pageNum = +route.queryParamMap.get('page');

        if (pageNum) {
            this.pageNum = pageNum;
        }

        return this.networkService.fetchUserHistory(this.pageNum);
    }
}
