import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Comment, BlogComment, WorkComment, CreateComment, EditComment } from 'shared-models';
import { AlertsService } from 'src/app/modules/alerts';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private url = `/api/content/comments`;

  constructor(private readonly http: HttpClient, private readonly alertsService: AlertsService) {}

  /**
   * Adds a comment to a blog.
   * 
   * @param blogId The ID of the blog
   * @param commentInfo the new comment to add
   */
  public addBlogComment(blogId: string, commentInfo: CreateComment) {
    return this.http.put<BlogComment>(`${this.url}/add-blog-comment/${blogId}`, commentInfo, {observe: 'response', withCredentials: true})
      .pipe(map(() => {
        this.alertsService.success(`Comment added successfully!`);
        return;
      }), catchError(err => {
        this.alertsService.error(err.error.message);
        return throwError(err);
      }));
  }

  /**
   * Adds a comment to a work.
   * 
   * @param workId The ID of the work
   * @param commentInfo the new comment to add
   */
  public addWorkComment(workId: string, commentInfo: CreateComment) {
    return this.http.put<WorkComment>(`${this.url}/add-work-comment/${workId}`, commentInfo, {observe: 'response', withCredentials: true})
    .pipe(map(() => {
      this.alertsService.success(`Comment added successfully!`);
      return;
    }), catchError(err => {
      this.alertsService.error(err.error.message);
      return throwError(err);
    }));
  }

  /**
   * Edits a comment.
   * 
   * @param commentId The comment to edit
   * @param commentInfo The new info about it
   */
  public editComment(commentId: string, commentInfo: EditComment) {
    return this.http.patch(`${this.url}/edit-comment/${commentId}`, commentInfo, {observe: 'response', withCredentials: true})
      .pipe(map(() => {
        this.alertsService.success(`Changes saved!`);
        return;
      }), catchError(err => {
        this.alertsService.error(err.error.message);
        return throwError(err);
      }));
  }
}
