import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PaginateResult } from '@dragonfish/models/util';
import { NewsCategory, NewsContentModel } from '@dragonfish/models/content';
import { Constants, Title } from '@dragonfish/utilities/constants';

@Component({
    selector: 'app-news',
    templateUrl: './news.component.html',
    styleUrls: ['./news.component.less'],
})
export class NewsComponent implements OnInit {
    posts: PaginateResult<NewsContentModel>;
    pageNum = 1;
    category = NewsCategory;

    constructor(private route: ActivatedRoute, private router: Router) {}

    ngOnInit(): void {
        this.route.data.subscribe((data) => {
            this.posts = data.feedData;
        });
        Title.setTwoPartTitle(Constants.NEWS);
    }

    /**
     * Handles page changing
     *
     * @param event The new page
     */
    onPageChange(event: number) {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { page: event },
            queryParamsHandling: 'merge',
        });
        this.pageNum = event;
    }
}
