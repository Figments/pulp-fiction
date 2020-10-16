import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';

import { FrontendUser } from '@pulp-fiction/models/users';
import { Collection } from '@pulp-fiction/models/collections';
import { PaginateResult } from '@pulp-fiction/models/util';
import { AuthService } from '../../../services/auth';
import { CollectionsService } from '../../../services/content';
import { CreateCollectionComponent } from '../../../components/modals/collections';

import { Constants, Title } from '../../../shared';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.less']
})
export class CollectionsComponent implements OnInit {
  currentUser: FrontendUser;

  loading = false;
  submitting = false;
  collections: PaginateResult<Collection>;

  pageNum = 1;

  constructor(private authService: AuthService, private collsService: CollectionsService, private dialog: MatDialog,
    private route: ActivatedRoute, private router: Router) {
    this.authService.currUser.subscribe(x => { this.currentUser = x; });
  }

  ngOnInit(): void {
    Title.setTwoPartTitle(Constants.COLLECTIONS);
    this.route.data.subscribe(data => {
      this.collections = data.feedData;
    });
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
   * Sets a collection to public.
   * 
   * @param collId The collection's ID
   */
  setPublic(collId: string) {
    this.submitting = true;
    this.collsService.setToPublic(collId).subscribe(() => {
      this.submitting = false;
      this.router.navigate([], {relativeTo: this.route, queryParams: {page: this.pageNum}, queryParamsHandling: 'merge'});
    });
  }

  /**
   * Sets a collection to private.
   * 
   * @param collId The collection's ID
   */
  setPrivate(collId: string) {
    this.submitting = true;
    this.collsService.setToPrivate(collId).subscribe(() => {
      this.submitting = false;
      this.router.navigate([], {relativeTo: this.route, queryParams: {page: this.pageNum}, queryParamsHandling: 'merge'});
    });
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

  /**
   * Opens the create collection modal
   */
  openCreateCollectionModal() {
    this.dialog.open(CreateCollectionComponent);
  }
}
