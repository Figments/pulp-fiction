import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { FrontendUser } from '@pulp-fiction/models/users';
import { Collection } from '@pulp-fiction/models/collections';
import { PaginateResult } from '@pulp-fiction/models/util';
import { AuthService } from '../../../services/auth';
import { CollectionsService, PortfolioService } from '../../../services/content';
import { PortCollections, PortWorks } from '../../../models/site';
import { Title, Constants } from '../../../shared';
import { CreateCollectionComponent } from '../../../components/modals/collections';

@Component({
    selector: 'port-collections',
    templateUrl: './collections.component.html',
    styleUrls: ['./collections.component.less']
})
export class CollectionsComponent implements OnInit {
    currentUser: FrontendUser;
    portUser: FrontendUser;
    collsData: PaginateResult<Collection>;
    userCollsData: PaginateResult<Collection>;

    pageNum = 1;
    submitting = false;
    listView = false;

    constructor(private route: ActivatedRoute, private router: Router, private collsService: CollectionsService,
        private portService: PortfolioService, private authService: AuthService, private dialog: MatDialog) {
            this.authService.currUser.subscribe(x => {
                this.currentUser = x;
            });
        }

    ngOnInit(): void {
        this.portUser = this.route.parent.snapshot.data.portData as FrontendUser;
        Title.setThreePartTitle(this.portUser.username, Constants.COLLECTIONS);

        /* this.route.data.subscribe(data => {
            const feedData = data.feedData as PortCollections;
            this.collsData = feedData.collections;
            this.userCollsData = feedData.userCollections;
        });*/
    }

    /**
     * Handles page changing
     * 
     * @param event The new page
     */
    onPageChange(event: number) {
        this.router.navigate([], {relativeTo: this.route, queryParams: {page: event}, queryParamsHandling: 'merge'});
        this.pageNum = event;
    }

    /**
     * Checks to see if the currently logged in user is the same as the one
     * that owns this portfolio.
     */
    currentUserIsSame() {
        return this.currentUser && this.portUser && this.currentUser._id === this.portUser._id;
    }

    /**
     * Opens the create collection modal
     */
    openCreateCollectionModal() {
        this.dialog.open(CreateCollectionComponent);
    }

    /**
     * Sets a collection to public or private depending on the value of the setPublic boolean.
     * 
     * @param collId The collection's ID
     * @param setPublic whether or not this request is to set a collection to public or private
     */
    setPublicPrivate(collId: string, setPublic: boolean) {
        if (setPublic) {
            this.submitting = true;
            this.collsService.setToPublic(collId).subscribe(() => {
                this.submitting = false;
                this.router.navigate([], {relativeTo: this.route, queryParams: {page: this.pageNum}, queryParamsHandling: 'merge'});
            });
        } else {
            this.submitting = true;
            this.collsService.setToPrivate(collId).subscribe(() => {
                this.submitting = false;
                this.router.navigate([], {relativeTo: this.route, queryParams: {page: this.pageNum}, queryParamsHandling: 'merge'});
            });
        }
    }

    /**
     * Sends a request to delete the specified collection.
     * 
     * @param collId The collection to delete
     */
    askDelete(collId: string) {
        if (confirm(`Are you sure you want to delete this collection? This action is irreversible.`)) {
            this.collsService.deleteCollection(collId).subscribe(() => {
                this.router.navigate([], {relativeTo: this.route, queryParams: {page: this.pageNum}, queryParamsHandling: 'merge'});
            });
        } else {
            return;
        }
    }
}