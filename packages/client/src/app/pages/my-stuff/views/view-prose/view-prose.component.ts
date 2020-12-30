import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { ContentKind, ProseContent, PubStatus } from '@pulp-fiction/models/content';
import { MyStuffService, SectionsService } from 'packages/client/src/app/services/user';
import { SectionItem } from '../../viewmodels';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthorsNotePos, SectionForm } from '@pulp-fiction/models/sections';
import { MatDialog } from '@angular/material/dialog';
import { UploadCoverartComponent } from 'packages/client/src/app/components/modals/works';

@Component({
    selector: 'view-prose',
    templateUrl: './view-prose.component.html',
    styleUrls: ['./view-prose.component.less']
})
export class ViewProseComponent implements OnInit {
    myProse: ProseContent;
    mySections: SectionItem[];
    pubStatus = PubStatus;
    loadingSections = false;
    editMode = false;
    addEditIcon = false;

    selectedPos = AuthorsNotePos.Bottom;
    authorsNotePosOptions = AuthorsNotePos;

    selectedSection: SectionItem;

    sectionForm = new FormGroup({
        title: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
        body: new FormControl('', [Validators.required, Validators.minLength(3)]),
        authorsNote: new FormControl('', [Validators.minLength(3)]),
        authorsNotePos: new FormControl(null)
    });

    constructor(private stuffService: MyStuffService, private sectionsService: SectionsService, public route: ActivatedRoute, 
        private router: Router, private location: Location, private snackBar: MatSnackBar, private dialog: MatDialog) {}

    ngOnInit(): void {
        this.myProse = this.route.snapshot.data.proseData as ProseContent;
        this.fetchData();
    }

    goBack() {
        this.location.back();
    }

    exitEditMode() {
        this.editMode = false;
    }

    get fields() { return this.sectionForm.controls; }

    private fetchData() {
        this.loadingSections = true;
        this.sectionsService.fetchUserContentSections(this.myProse._id).subscribe(sections => {
            this.mySections = sections.reverse() as SectionItem[];
            this.loadingSections = false;
        });
    }

    addSection() {
        if (this.selectedSection) {
            this.selectedSection.selected = false;
            this.selectedSection = null;
        }
        this.editMode = true;
    }

    selectThisSection(section: SectionItem) {
        if (this.selectedSection) {
            this.selectedSection.selected = false;
            this.selectedSection = null;
        }
        
        section.selected = true;
        this.selectedSection = section;
    }

    submitToQueue() {
        if (this.myProse.stats.words < 750) {
            this.snackBar.open(`Prose must have a minimum of 750 words in total before submitting to the queue.`);
            return;
        }
    
        this.stuffService.publishOne(this.myProse._id).subscribe(() => {
            this.myProse.audit.published = this.pubStatus.Pending;
        });
    }

    submitForm() {
        if (this.fields.title.invalid) {
            this.snackBar.open(`Chapter titles need to be between 3 and 100 characters long.`);
            return;
        }

        if (this.fields.body.invalid) {
            this.snackBar.open(`Chapters need to be more than 3 characters long.`);
            return;
        }

        if (this.fields.authorsNote.invalid) {
            this.snackBar.open(`Authors notes need to be more than 3 characters long.`);
            return;
        }

        const sectionForm: SectionForm = {
            title: this.fields.title.value,
            body: this.fields.body.value,
            authorsNote: this.fields.authorsNote.value,
            authorsNotePos: this.fields.authorsNotePos.value,
            usesNewEditor: true
        };

        this.sectionsService.createSection(this.myProse._id, sectionForm).subscribe(() => {
            this.editMode = false;
            this.sectionForm.reset();
            this.fetchData();
        });
    }

    deleteWork() {
        if (confirm(`Are you sure you want to delete this? This action is irreversible.`)) {
            this.stuffService.deleteOne(this.myProse._id).subscribe(() => {
                this.router.navigate(['/my-stuff']);
            });
        } else {
            return;
        }
    }

    editWork() {
        this.router.navigate(['/my-stuff/edit-prose'], {queryParams: {contentId: this.myProse._id, kind: this.myProse.kind}, queryParamsHandling: 'merge'});
    }

    uploadCoverart() {
        const dialogRef = this.dialog.open(UploadCoverartComponent, {data: {kind: ContentKind.ProseContent, contentId: this.myProse._id}});
        dialogRef.afterClosed().subscribe(() => {
            location.reload();
        });
    }
}