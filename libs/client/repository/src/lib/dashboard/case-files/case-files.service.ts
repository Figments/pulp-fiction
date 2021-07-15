import { Injectable } from '@angular/core';
import { CaseFilesStore } from './case-files.store';
import { CaseFilesQuery } from './case-files.query';
import { DragonfishNetworkService } from '@dragonfish/client/services';
import { AlertsService } from '@dragonfish/client/alerts';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NoteForm } from '@dragonfish/shared/models/case-files';
import { arrayAdd } from '@datorama/akita';
import { FrontendUser } from '@dragonfish/shared/models/users';

@Injectable({ providedIn: 'root' })
export class CaseFilesService {
    constructor(
        private caseFilesStore: CaseFilesStore,
        private caseFilesQuery: CaseFilesQuery,
        private network: DragonfishNetworkService,
        private alerts: AlertsService,
    ) {}

    public fetchAllActive() {
        return this.network.fetchActiveCaseFiles().pipe(
            tap((value) => {
                this.caseFilesStore.set(value);
            }),
            catchError((err) => {
                this.alerts.error(err.error.message);
                return throwError(err);
            }),
        );
    }

    public setCurrent(id: number) {
        this.caseFilesStore.setActive(id);
    }

    public claimFile(id: number) {
        return this.network.claimFile(id).pipe(
            tap((value) => {
                this.caseFilesStore.update(id, () => ({
                    claimedBy: value.claimedBy as FrontendUser,
                }));
            }),
        );
    }

    public addNote(id: number, form: NoteForm) {
        return this.network.addNote(id, form).pipe(
            tap((value) => {
                this.caseFilesStore.update(id, ({ notes }) => ({
                    notes: arrayAdd(notes, value),
                }));
            }),
            catchError((err) => {
                this.alerts.error(err.error.message);
                return throwError(err);
            }),
        );
    }
}
