import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { AlertsService } from 'src/app/modules/alerts';
import { Collection, CreateCollection, EditCollection } from 'shared-models';

@Injectable({
  providedIn: 'root'
})
export class CollectionsService {
  private url = `/api/content/collections`;

  constructor(private http: HttpClient, private alertsService: AlertsService) { }

  /**
   * Creates a collection in the database.
   * 
   * @param collInfo A collection's info
   */
  public createCollection(collInfo: CreateCollection) {
    return this.http.put<void>(`${this.url}/create-collection`, collInfo, {observe: 'response', withCredentials: true}) 
      .pipe(map(() => {
        this.alertsService.success(`Collection successfully created.`);
        return;
      }), catchError(err => {
        this.alertsService.error(err.error.message);
        return throwError(err);
      }));
  }

  /**
   * Fetches a user's collections.
   */
  public fetchUserCollections() {
    return this.http.get<Collection[]>(`${this.url}/fetch-user-collections`, {observe: 'response', withCredentials: true})
      .pipe(map(colls => {
        return colls.body;
      }), catchError(err => {
        this.alertsService.error(err.error.message);
        return throwError(err);
      }));
  }

  /**
   * Sends edits for a collection to the database.
   * 
   * @param collId A collection's ID
   * @param collInfo The new collection info
   */
  public editCollection(collId: string, collInfo: EditCollection) {
    return this.http.patch<void>(`${this.url}/edit-collection/${collId}`, collInfo, {observe: 'response', withCredentials: true})
      .pipe(map(()=> {
        this.alertsService.success(`Edits saved successfully.`);
        return;
      }), catchError(err => {
        this.alertsService.error(err.error.message);
        return throwError(err);
      }));
  }

  /**
   * Deletes a collection belonging to this user.
   * 
   * @param collId The collection ID
   */
  public deleteCollection(collId: string) {
    return this.http.patch<void>(`${this.url}/delete-collection/${collId}`, {}, {observe: 'response', withCredentials: true})
      .pipe(map(() => {
        this.alertsService.success(`Collection deleted successfully.`);
        return;
      }), catchError(err => {
        this.alertsService.error(err.error.message);
        return throwError(err);
      }));
  }

  /**
   * Adds a work to a collection.
   * 
   * @param collId The collection
   * @param workId The work
   */
  public addWork(collId: string, workId: string) {
    return this.http.patch<void>(`${this.url}/add-work/${collId}/${workId}`, {}, {observe: 'response', withCredentials: true})
      .pipe(map(() => {
        this.alertsService.success(`Work added to collection.`);
        return;
      }), catchError(err => {
        this.alertsService.error(err.error.message);
        return throwError(err);
      }));
  }

  /**
   * Removes a work from a collection.
   * 
   * @param collId The collection
   * @param workId The work
   */
  public removeWork(collId: string, workId: string) {
    return this.http.patch<void>(`${this.url}/remove-work/${collId}/${workId}`, {}, {observe: 'response', withCredentials: true})
      .pipe(map(() => {
        this.alertsService.success(`Work removed from collection.`);
        return;
      }), catchError(err => {
        this.alertsService.error(err.error.message);
        return throwError(err);
      }));
  }
}
