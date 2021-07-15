import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { CaseFilesState } from './case-files.state';
import { CaseFilesStore } from './case-files.store';
import { CaseFile } from '@dragonfish/shared/models/case-files';

@Injectable({ providedIn: 'root' })
export class CaseFilesQuery extends QueryEntity<CaseFilesState> {
    public loading$ = this.selectLoading();
    public all$ = this.selectAll();
    public current$ = this.selectActive<CaseFile>();

    constructor(protected store: CaseFilesStore) {
        super(store);
    }
}
