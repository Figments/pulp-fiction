import { Component } from '@angular/core';
import { CaseFilesQuery } from '@dragonfish/client/repository/dashboard/case-files';
import { CaseKind } from '@dragonfish/shared/models/case-files';

@Component({
    selector: 'dragonfish-view-file',
    templateUrl: './view-file.component.html',
})
export class ViewFileComponent {
    caseKind = CaseKind;

    constructor(public fileQuery: CaseFilesQuery) {}
}
