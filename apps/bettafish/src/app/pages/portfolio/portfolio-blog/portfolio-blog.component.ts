import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable, combineLatest } from 'rxjs';
import { FrontendUser } from '@dragonfish/shared/models/users';
import { PaginateResult } from '@dragonfish/shared/models/util';
import { BlogsContentModel, ContentFilter, ContentKind } from '@dragonfish/shared/models/content';
import { setThreePartTitle, Constants } from '@dragonfish/shared/constants';
import { PortfolioState } from '@dragonfish/client/repository/portfolio';
import { DragonfishNetworkService } from '@dragonfish/client/services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { GlobalState } from '@dragonfish/client/repository/global';
import { SessionQuery } from '@dragonfish/client/repository/session';

@UntilDestroy()
@Component({
    selector: 'dragonfish-portfolio-blog',
    templateUrl: './portfolio-blog.component.html'
})
export class PortfolioBlogComponent implements OnInit {
    @Select(PortfolioState.currPortfolio) portUser$: Observable<FrontendUser>;
    @SelectSnapshot(GlobalState.filter) filter: ContentFilter;

    loading = false;
    blogsData: PaginateResult<BlogsContentModel>;

    pageNum = 1;

    constructor(
        private network: DragonfishNetworkService,
        private route: ActivatedRoute,
        private router: Router,
        public sessionQuery: SessionQuery,
    ) { }

    ngOnInit(): void {
        combineLatest(this.portUser$, this.route.queryParamMap).pipe(untilDestroyed(this))
            .subscribe(value => {
                const [portUser, params] = value;
                this.pageNum = params.has('page') ? +params.get('page') : 1;
                setThreePartTitle(portUser.username, Constants.BLOGS);
                this.fetchData(this.pageNum, portUser._id);
            });
    }

    /**
     * Fetches data for the current page.
     *
     * @param pageNum The page number
     * @param userId The user ID related to the content
     * @private
     */
    private fetchData(pageNum: number, userId: string): void {
        this.loading = true;
        this.network.fetchAllContent(pageNum, [ContentKind.BlogContent], this.filter, userId)
            .subscribe(content => {
                this.blogsData = content as any;
                this.loading = false;
            });
    }

    /**
     * Handles page changing
     *
     * @param event The new page
     */
    onPageChange(event: number, userId: string) {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { page: event },
            queryParamsHandling: 'merge',
        }).then(() => {
            this.fetchData(event, userId);
        });
        this.pageNum = event;
    }
}
