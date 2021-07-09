import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertsService } from '@dragonfish/client/alerts';
import { isNullOrUndefined } from '@dragonfish/shared/functions';

@Component({
    selector: 'dragonfish-insert-image',
    templateUrl: './insert-link.component.html',
})
export class InsertLinkComponent {
    insertLink = new FormGroup({
        link: new FormControl('', Validators.required),
    });

    constructor(
        private dialogRef: MatDialogRef<InsertLinkComponent>,
        private alerts: AlertsService,
        @Inject(MAT_DIALOG_DATA) public data: { title: string },
    ) {}

    cancel() {
        this.dialogRef.close();
    }

    submit() {
        if (this.insertLink.invalid) {
            this.alerts.error(`You must add a link!`);
            return;
        }

        this.dialogRef.close(this.insertLink.controls.link.value);
    }
}
