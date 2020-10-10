import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FileUploader, ParsedResponseHeaders, FileItem } from 'ng2-file-upload';
import { CookieService } from 'ngx-cookie';

import { HttpError } from '../../models/site';
import { FrontendUser, CreateUser, LoginUser, ChangePassword,
  ChangeProfile, ChangeEmail, ChangeUsername, UpdateTagline } from '@pulp-fiction/models/users';
import { ContentFilter } from '@pulp-fiction/models/works';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currUserSubject: BehaviorSubject<FrontendUser>;
  public currUser: Observable<FrontendUser>;
  private url: string = `/api/auth`;

  constructor(private http: HttpClient, private router: Router, private snackBar: MatSnackBar, private cookies: CookieService) {
    this.currUserSubject = new BehaviorSubject<FrontendUser>(JSON.parse(localStorage.getItem('currentUser')));
    this.currUser = this.currUserSubject.asObservable();
  }

  /**
   * Gets the current user value from the user subject.
   */
  public getCurrUserValue(): FrontendUser {
    return this.currUserSubject.value;
  }

  /* Authorization */

  /**
   * Sends a new user's info to the backend. If the response is successful,
   * the `user` is returned and their info is set in local storage. Otherwise,
   * sends the backend error to all subscribed observables.
   *
   * @param credentials A user's credentials.
   */
  public register(credentials: CreateUser): Observable<FrontendUser> {
    return this.http.post<FrontendUser>(`${this.url}/register`, credentials, { observe: 'response', withCredentials: true })
      .pipe(map(user => {
        localStorage.setItem('currentUser', JSON.stringify(user.body));
        this.currUserSubject.next(user.body);
        this.router.navigate(['/home']).then(() => {
          location.reload();
        });
        return user.body;
      }), catchError(err => {
        console.log(err);
        return throwError(err);
      }));
  }

  /**
   * Sends a returning user's credentials to the backend to be verified.
   * If the response is successful, the `user` is returned and their info
   * is set in local storage. Otherwise, sends the backend error to all
   * subscribed observables.
   *
   * @param credentials A user's credentials.
   */
  public login(credentials: LoginUser): Observable<FrontendUser> {
    return this.http.post<FrontendUser>(`${this.url}/login`, credentials, { withCredentials: true, observe: 'response' })
      .pipe(map(user => {
        localStorage.setItem('currentUser', JSON.stringify(user.body));
        this.currUserSubject.next(user.body);
        this.router.navigate(['/home']).then(() => {
          location.reload();
        });
        return user.body;
      }), catchError(err => {
        this.snackBar.open(err.error.message);
        return throwError(err);
      }));
  }

  /**
   * Refreshes the current user token with new User info.
   * If refresh fails, 
   */
  public refreshToken(): Observable<string | null> {
    return this.http.get<FrontendUser>(`${this.url}/refresh-token`, { observe: 'response', withCredentials: true })
      .pipe(map(user => {
        localStorage.setItem('currentUser', JSON.stringify(user.body));
        this.currUserSubject.next(user.body);
        return user.body.token;
      }), catchError(err => {
        if (err.status === 403) {
          // A 403 means that the refreshToken has expired, or we didn't send one up at all, which is Super Suspicious          
          localStorage.removeItem('currentUser');
          this.currUserSubject.next(null);    
          this.router.navigate(['/home/latest']);    
          this.snackBar.open(`${err.error.message}. You have been logged out.`);
          return null;          
        }
        this.snackBar.open(err.error.message);
        return throwError(err);
      }));
  }

  /**
   * Logs the user out, sets the user object to null, removes their info from localStorage, and
   * navigates to home.
   */
  public logout(): void {
    // Fire and forget. If this fails, it doesn't matter to the user, 
    // and we don't want to leak that fact anyway.
    this.http.get(`${this.url}/logout`, { withCredentials: true }).subscribe();
    
    this.cookies.remove('contentFilter');
    localStorage.removeItem('currentUser');
    this.currUserSubject.next(null);
    this.snackBar.open('See you next time!');
    this.router.navigate(['/home/latest']);    
  }

  /* Account settings */

  /**
   * Sends a request to change a user's email.
   * @param newEmail The requested new email and current password.
   */
  public changeEmail(newEmail: ChangeEmail): Observable<FrontendUser> {
    return this.http.patch<FrontendUser>(`${this.url}/change-email`, newEmail, { observe: 'response', withCredentials: true })
      .pipe(map(user => {
        localStorage.setItem('currentUser', JSON.stringify(user.body));
        this.currUserSubject.next(user.body);
        return user.body;
      }), catchError(err => {
        this.snackBar.open(err.error.message);
        return throwError(err);
      }));
  }

  /**
   * Sends a request to change a user's username.
   * @param newUsername The reuqested new username and current password.
   */
  public changeUsername(newUsername: ChangeUsername): Observable<FrontendUser> {
    return this.http.patch<FrontendUser>(`${this.url}/change-username`, newUsername, { observe: 'response', withCredentials: true})
      .pipe(map(user => {
        localStorage.setItem('currentUser', JSON.stringify(user.body));
        this.currUserSubject.next(user.body);
        return user.body;
      }), catchError(err => {
        this.snackBar.open(err.error.message);
        return throwError(err);
      }));
  }

  /**
   * Sends a request to change a user's password.
   * 
   * @param newPasswordInfo The new password requested
   */
  public changePassword(newPasswordInfo: ChangePassword) {
    return this.http.patch<FrontendUser>(`${this.url}/change-password`, newPasswordInfo, { observe: 'response', withCredentials: true })
      .pipe(map(user => {
        localStorage.setItem('currentUser', JSON.stringify(user.body));
        this.currUserSubject.next(user.body);
        return user.body;
      }), catchError(err => {
        this.snackBar.open(err.error.message);
        return throwError(err);
      }));
  }

  /**
   * Sends a request to change a user's profile.
   * 
   * @param newProfileInfo The new profile info requested
   */
  public changeProfile(newProfileInfo: ChangeProfile) {
    return this.http.patch<FrontendUser>(`${this.url}/update-profile`, newProfileInfo, { observe: 'response', withCredentials: true })
      .pipe(map(user => {
        localStorage.setItem('currentUser', JSON.stringify(user.body));
        this.currUserSubject.next(user.body);
        return user.body;
      }), catchError(err => {
        this.snackBar.open(err.error.message);
        return throwError(err);
      }));
  }

  /**
   * Sends a message to the server instructing it to set the user's 
   * 'agreedToPolicies' field to true. On success, returns the updated
   * user object.
   */
  public agreeToPolicies(): Observable<FrontendUser> {
    return this.http.post<FrontendUser>(`${this.url}/agree-to-policies`, null, { observe: 'response', withCredentials: true })
      .pipe(map(user => {
        localStorage.setItem('currentUser', JSON.stringify(user.body));
        this.currUserSubject.next(user.body);
        return user.body;
      }), catchError(err => {
        this.snackBar.open(err.error.message);
        return throwError(err);
      }));
  }

  /**
   * Uploads a user's avatar to the server for processing.
   * 
   * @param uploader the file uploader
   */
  public changeAvatar(uploader: FileUploader): Observable<FrontendUser> {
    return new Observable<FrontendUser>(observer => {
      uploader.onCompleteItem = (_: FileItem, response: string, status: number, __: ParsedResponseHeaders) => {

        if (status !== 201) {
          const errorMessage: HttpError = this.tryParseJsonHttpError(response);
          if (!errorMessage) {
            const juryRiggedError: HttpError = {
              statusCode: status, 
              error: response
            };
            return observer.error(juryRiggedError);
          } else  {
            return observer.error(errorMessage);
          }
        }

        // parse out the new user and set it
        const newUser: FrontendUser = JSON.parse(response);
        localStorage.setItem('currentUser', response);
        this.currUserSubject.next(newUser);
        observer.next(newUser);
        observer.complete();
      };

      uploader.uploadAll();
    });
  }

  /**
   * Updates a user's tagline.
   * 
   * @param tagline The new tagline
   */
  public updateTagline(tagline: UpdateTagline) {
    return this.http.patch<FrontendUser>(`${this.url}/update-tagline`, tagline, {observe: 'response', withCredentials: true})
      .pipe(map(user => {
        localStorage.setItem('currentUser', JSON.stringify(user.body));
        this.currUserSubject.next(user.body);
        return user.body;
      }), catchError(err => {
        return throwError(err);
      }));
  }

  /**
   * Sets the contentFilter cookie based on the values of the two provided booleans.
   * 
   * @param enableMature Enable mature check
   * @param enableExplicit Enable explicit check
   */
  public setContentFilter(enableMature: boolean, enableExplicit: boolean) {
    if (enableMature === true && enableExplicit === false) {
      this.cookies.put('contentFilter', ContentFilter.MatureEnabled);
    } else if (enableMature === false && enableExplicit === true) {
      this.cookies.put('contentFilter', ContentFilter.ExplicitEnabled);
    } else if (enableMature === true && enableExplicit === true) {
      this.cookies.put('contentFilter', ContentFilter.Everything);
    } else if (enableMature === false && enableExplicit === false) {
      this.cookies.put('contentFilter', ContentFilter.Default);
    }

    location.reload();
  }

  private tryParseJsonHttpError(response: string): HttpError | null {
    try {
      const error: HttpError = JSON.parse(response);
      return error;
    } catch (err) {
      return null;
    }
  }
}