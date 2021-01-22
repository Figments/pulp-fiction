import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { UserState } from '../../../shared/user';
import { Observable, Subscription } from 'rxjs';

import { Genres, PoetryContent, PoetryForm, WorkStatus } from '@pulp-fiction/models/content';
import { ReadingHistory } from '@pulp-fiction/models/reading-history';
import { FrontendUser } from '@pulp-fiction/models/users';
import { ContentPage } from '../../../models/site';

import { Title } from '../../../shared';
import { ContentState } from '../../../shared/content';

@Component({
    selector: 'poetry-page',
    templateUrl: './poetry-page.component.html',
    styleUrls: ['./poetry-page.component.less']
})
export class PoetryPageComponent implements OnInit {
    @Select(UserState.currUser) currentUser$: Observable<FrontendUser>;
    currentUserSubscription: Subscription;
    currentUser: FrontendUser;

    @Select(ContentState.currContent) currContent$: Observable<PoetryContent>;

    pageNum = 1;
    ratingSize = 'large';

    poetryForm = PoetryForm;
    contentStatus = WorkStatus;
    contentGenres = Genres;

    constructor(public route: ActivatedRoute, private router: Router) {
        this.currentUserSubscription = this.currentUser$.subscribe(x => {
            this.currentUser = x;
        });
        this.fetchData();
    }

    ngOnInit(): void {
        this.currContent$.subscribe(x => {
            Title.setTwoPartTitle(x.title);
        });
    }

    /**
     * Changes the size of the rating icon depending on the size of the window.
     * 
     * @param event Window resize event
     */
    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        if (window.innerWidth < 1000) {
            this.ratingSize = 'small';
        } else {
            this.ratingSize = 'large';
        }
    }

    /**
     * Fetches the current page of comments.
     */
    private fetchData() {
        const queryParams = this.route.snapshot.queryParamMap;    
        if (queryParams.get('page') !== null) {
            this.pageNum = +queryParams.get('page');
        }
    }
    
    /**
     * Changes query params to the appropriate page.
     * @param event The page changed to
     */
    onPageChange(event: number) {
        if (event !== 1) {
        this.router.navigate([], {relativeTo: this.route, queryParams: {page: event}, queryParamsHandling: 'merge'});
        } else {
        this.router.navigate([], {relativeTo: this.route});
        }
    }
}