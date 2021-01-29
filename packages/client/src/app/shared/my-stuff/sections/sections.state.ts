import { Injectable } from '@angular/core';
import { State, StateContext, Action, Selector } from '@ngxs/store';
import { patch, updateItem, removeItem } from '@ngxs/store/operators';
import { throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { Sections } from './sections.actions';
import { SectionsStateModel } from './sections-state.model';
import { MyStuffService } from '../services';
import { Section } from '@pulp-fiction/models/sections';
import { AlertsService } from '../../alerts';

@State<SectionsStateModel>({
    name: 'sections',
    defaults: {
        sections: [],
        currSection: null
    }
})
@Injectable()
export class SectionsState {
    constructor (private stuffService: MyStuffService, private alerts: AlertsService) {}

    @Action(Sections.SetAll)
    public setAll({ patchState }: StateContext<SectionsStateModel>, { contentId }: Sections.SetAll) {
        return this.stuffService.fetchSections(contentId).pipe(tap((result: Section[]) => {
            patchState({
                sections: result
            });
        }), catchError(err => {
            this.alerts.error(err.error);
            return throwError(err);
        }));
    }

    @Action(Sections.SetCurrent)
    public setCurrent({ patchState }: StateContext<SectionsStateModel>, { section }: Sections.SetCurrent) {
        patchState({
            currSection: section
        });
    }

    @Action(Sections.Create)
    public create({ getState, patchState }: StateContext<SectionsStateModel>, { contentId, sectionInfo }: Sections.Create) {
        return this.stuffService.createSection(contentId, sectionInfo).pipe(tap((result: Section) => {
            this.alerts.success(`Section created!`);
            patchState({
                sections: [...getState().sections, result],
                currSection: result
            });
        }), catchError(err => {
            this.alerts.error(err.error);
            return throwError(err);
        }));
    }

    @Action(Sections.Save)
    public save({ setState }: StateContext<SectionsStateModel>, { contentId, sectionId, sectionInfo }: Sections.Save) {
        return this.stuffService.editSection(contentId, sectionId, sectionInfo).pipe(tap((result: Section) => {
            this.alerts.success(`Changes saved!`);
            setState(patch({
                sections: updateItem<Section>(section => section._id === result._id, result),
                currSection: result
            }));
        }), catchError(err => {
            this.alerts.error(err.error);
            return throwError(err);
        }));
    }

    @Action(Sections.Publish)
    public publish({ setState }: StateContext<SectionsStateModel>, { contentId, sectionId, pubStatus }: Sections.Publish) {
        return this.stuffService.publishSection(contentId, sectionId, pubStatus).pipe(tap((result: Section) => {
            setState(patch({
                sections: updateItem<Section>(section => section._id === result._id, result),
                currSection: result
            }));
        }), catchError(err => {
            this.alerts.error(err.error);
            return throwError(err);
        }));
    }

    @Action(Sections.Delete)
    public delete({ setState }: StateContext<SectionsStateModel>, { contentId, sectionId }: Sections.Delete) {
        return this.stuffService.deleteSection(contentId, sectionId).pipe(tap((result: Section) => {
            setState(patch({
                sections: removeItem<Section>(section => section._id === result._id),
                currSection: null
            }));
        }), catchError(err => {
            this.alerts.error(err.error);
            return throwError(err);
        }));
    }

    @Selector()
    public static sections(state: SectionsStateModel): Section[] {
        return state.sections;
    }

    @Selector()
    public static currSection(state: SectionsStateModel): Section {
        return state.currSection;
    }
}