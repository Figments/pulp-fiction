import { Component } from '@angular/core';
import { ContentModel, ContentKind } from '@dragonfish/shared/models/content';
import { RatingOption } from '@dragonfish/shared/models/reading-history';
import { ContentService } from '@dragonfish/client/repository/content/services';
import { UntilDestroy } from '@ngneat/until-destroy';
import { MatDialog } from '@angular/material/dialog';
import { AddToCollectionComponent } from '../collections/add-to-collection/add-to-collection.component';
import { ContentViewQuery, ContentViewService } from '@dragonfish/client/repository/content-view';

@UntilDestroy()
@Component({
    selector: 'dragonfish-content-rating',
    templateUrl: './content-rating.component.html',
    styleUrls: ['./content-rating.component.scss']
})
export class ContentRatingComponent {
    ratingOption = RatingOption;
    contentKind = ContentKind;
    optionsIsOpen = false;

    constructor(
        private content: ContentService,
        private dialog: MatDialog,
        public viewService: ContentViewService,
        public viewQuery: ContentViewQuery,
    ) {}

    /**
     * Opens the Add To Collection dialog box.
     */
    openAddToCollectionDialog(content: ContentModel) {
        this.dialog.open(AddToCollectionComponent, { data: { content: content } });
    }
}
