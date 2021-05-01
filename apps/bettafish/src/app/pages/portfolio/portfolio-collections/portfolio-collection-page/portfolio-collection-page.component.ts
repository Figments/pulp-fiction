import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { FrontendUser } from '@dragonfish/shared/models/users';
import { Collection } from '@dragonfish/shared/models/collections';
import { UserState } from '../../../../repo/user';
import { PortfolioState } from '../../../../repo/portfolio';
import { NetworkService } from '../../../../services';
import { CollectionFormComponent } from '../../../../components/content/collections/collection-form/collection-form.component';
import { PopupModel } from '@dragonfish/shared/models/util';
import { PopupComponent } from '@dragonfish/client/ui';

@Component({
    selector: 'dragonfish-portfolio-collection-page',
    templateUrl: './portfolio-collection-page.component.html',
    styleUrls: ['./portfolio-collection-page.component.scss']
})
export class PortfolioCollectionPageComponent {
    @Select(PortfolioState.currPortfolio) portUser$: Observable<FrontendUser>;
    @Select(UserState.currUser) currentUser$: Observable<FrontendUser>;
    collData: Collection;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private network: NetworkService,
        private location: Location,
        private dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.route.data.subscribe((data) => {
            this.collData = data.collData as Collection;
        });
    }

    /**
     * Opens the create collection modal in edit mode.
     *
     * @param coll The collection to edit
     */
    openEditCollectionModal(coll: Collection) {
        const dialogRef = this.dialog.open(CollectionFormComponent, { data: { currColl: coll } });

        dialogRef.afterClosed().subscribe(() => {
            this.router.navigate([], { relativeTo: this.route, queryParamsHandling: 'merge' });
        });
    }

    /**
     * Sends a request to delete the specified collection.
     *
     * @param collId The collection to delete
     */
    askDelete(collId: string) {
        const alertData: PopupModel = {
            message: 'Are you sure you want to delete this collection? This action is irreversible.',
            confirm: true,
        };
        const dialogRef = this.dialog.open(PopupComponent, { data: alertData });
        dialogRef.afterClosed().subscribe((wantsToDelete: boolean) => {
            if (wantsToDelete) {
                this.network.deleteCollection(collId).subscribe(() => {
                    this.location.back();
                });
            } else {
                return;
            }
        });
    }

    /**
     * Sets a collection to public or private depending on the value of the setPublic boolean.
     *
     * @param collId The collection's ID
     * @param setPublic whether or not this request is to set a collection to public or private
     */
    setPublicPrivate(collId: string, setPublic: boolean) {
        if (setPublic) {
            this.network.setCollectionToPublic(collId).subscribe(() => {
                this.router.navigate([], { relativeTo: this.route, queryParamsHandling: 'merge' });
            });
        } else {
            this.network.setCollectionToPrivate(collId).subscribe(() => {
                this.router.navigate([], { relativeTo: this.route, queryParamsHandling: 'merge' });
            });
        }
    }
}
