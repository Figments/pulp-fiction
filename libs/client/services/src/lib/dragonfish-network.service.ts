import {
    ChangeBio,
    ChangeEmail,
    ChangePassword,
    ChangeUsername,
    CreateUser,
    FrontendUser,
    InviteCodes,
    LoginUser,
    UpdateTagline,
    User,
} from '@dragonfish/shared/models/users';
import { Collection, CollectionForm } from '@dragonfish/shared/models/collections';
import { Comment, CommentForm, CommentKind } from '@dragonfish/shared/models/comments';
import {
    ContentFilter,
    ContentKind,
    ContentModel,
    FormType,
    NewsContentModel,
    PubChange,
    PubContent,
    SetRating,
} from '@dragonfish/shared/models/content';
import { CreateInitialMessage, CreateResponse, MessageThread } from '@dragonfish/shared/models/messages';
import { FileItem, FileUploader, ParsedResponseHeaders } from 'ng2-file-upload';
import { HttpClient } from '@angular/common/http';
import { InitialResults, PaginateResult } from '@dragonfish/shared/models/util';
import { MarkReadRequest, NotificationBase, NotificationSubscription } from '@dragonfish/shared/models/notifications';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { handleResponse, tryParseJsonHttpError } from '@dragonfish/shared/functions';
import { ApprovalQueue } from '@dragonfish/shared/models/approval-queue';
import { Decision } from '@dragonfish/shared/models/contrib';
import { FrontPageStats } from '@dragonfish/shared/models/stats';
import { HttpError } from '@dragonfish/shared/models/util';
import { Injectable, NgZone } from '@angular/core';
import { ReadingHistory } from '@dragonfish/shared/models/reading-history';
import { PublishSection, Section, SectionForm } from '@dragonfish/shared/models/sections';
import { CookieService } from 'ngx-cookie';
import { RatingsModel } from '@dragonfish/shared/models/ratings';
import { CaseFile, CaseKind, Note, NoteForm, ReportForm } from '@dragonfish/shared/models/case-files';

/**
 * ## DragonfishNetworkService
 *
 * Manages API calls to the Dragonfish backend.
 */
@Injectable({
    providedIn: 'root',
})
export class DragonfishNetworkService {
    private baseUrl = `/api`;
    constructor(
        private readonly http: HttpClient,
        private readonly cookieService: CookieService,
        private _zone: NgZone,
    ) {}

    //#region ---APPROVAL QUEUE---

    /**
     * Gets the entire queue.
     */
    public getQueue(pageNum: number): Observable<PaginateResult<ApprovalQueue>> {
        return handleResponse(
            this.http.get<PaginateResult<ApprovalQueue>>(`${this.baseUrl}/approval-queue/get-queue/${pageNum}`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Gets the claimed works from one moderator.
     */
    public getQueueForMod(pageNum: number): Observable<PaginateResult<ApprovalQueue>> {
        return handleResponse(
            this.http.get<PaginateResult<ApprovalQueue>>(
                `${this.baseUrl}/approval-queue/get-queue-for-mod/${pageNum}`,
                {
                    observe: 'response',
                    withCredentials: true,
                },
            ),
        );
    }

    /**
     * Claims a work.
     *
     * @param docId The document to claim
     */
    public claimWork(docId: string): Observable<ApprovalQueue> {
        return handleResponse(
            this.http.patch<ApprovalQueue>(
                `${this.baseUrl}/approval-queue/claim-content/${docId}`,
                {},
                {
                    observe: 'response',
                    withCredentials: true,
                },
            ),
        );
    }

    /**
     * Approves a work.
     *
     * @param decision Info about the decision.
     */
    public approveWork(decision: Decision): Observable<void> {
        return handleResponse(
            this.http.patch<void>(`${this.baseUrl}/approval-queue/approve-content`, decision, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Rejects a work.
     *
     * @param decision Info about the decision.
     */
    public rejectWork(decision: Decision): Observable<void> {
        return handleResponse(
            this.http.patch<void>(`${this.baseUrl}/approval-queue/reject-content`, decision, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Fetches a piece of content for viewing.
     *
     * @param contentId The content ID
     * @param kind The content kind
     * @param userId The owner of the content
     */
    public viewApprovalQueueContent(contentId: string, kind: ContentKind, userId: string): Observable<ContentModel> {
        return handleResponse(
            this.http.get<ContentModel>(
                `${this.baseUrl}/approval-queue/view-content?contentId=${contentId}&kind=${kind}&userId=${userId}`,
                {
                    observe: 'response',
                    withCredentials: true,
                },
            ),
        );
    }

    /**
     * Submits a work to the approval queue.
     *
     * @param workId The work to submit
     */
    public submitWorkForApproval(workId: string) {
        return handleResponse(
            this.http.post<void>(
                `${this.baseUrl}/approval-queue/submit-work/${workId}`,
                {},
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    //#endregion

    //#region ---AUTH---

    /**
     * Sends a new user's info to the backend. If the response is successful,
     * the `user` is returned and their info is set in local storage. Otherwise,
     * sends the backend error to all subscribed observables.
     *
     * @param credentials A user's credentials.
     */
    public register(credentials: CreateUser): Observable<FrontendUser> {
        return handleResponse(
            this.http.post<FrontendUser>(`${this.baseUrl}/auth/register`, credentials, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Sends a returning user's credentials to the backend to be verified.
     * If the response is successful, the `user` is returned. Otherwise, sends the backend error to all
     * subscribed observables.
     *
     * @param credentials A user's credentials.
     */
    public login(credentials: LoginUser): Observable<FrontendUser> {
        return handleResponse(
            this.http.post<FrontendUser>(`${this.baseUrl}/auth/login`, credentials, {
                withCredentials: true,
                observe: 'response',
            }),
        );
    }

    /**
     * Logs the user out.
     */
    public logout(): Observable<void> {
        return this.http.get<void>(`${this.baseUrl}/auth/logout`, { withCredentials: true });
    }

    /**
     * Refreshes the current user token with new User info.
     * If refresh fails, return `null`.
     */
    public refreshToken(): Observable<string | null> {
        return this.http
            .get<{ newToken: string }>(`${this.baseUrl}/auth/refresh-token`, {
                observe: 'response',
                withCredentials: true,
            })
            .pipe(
                map((user) => {
                    return user.body.newToken;
                }),
                catchError((err) => {
                    if (err.status === 403) {
                        // A 403 means that the refreshToken has expired, or we didn't send one up at all, which is Super Suspicious
                        return of<string>(null);
                    }
                    return throwError(err);
                }),
            );
    }
    //#endregion

    //#region ---BROWSE---

    /**
     * Fetches the first few new works for the browse page.
     * @param contentFilter The rating filter to apply to the fetch
     */
    public fetchFirstNew(contentFilter: ContentFilter) {
        return handleResponse(
            this.http.get<ContentModel[]>(`${this.baseUrl}/browse/fetch-first-new?filter=${contentFilter}`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Fetches all new works for the browse page.
     *
     * @param pageNum The current page
     * @param kinds The kinds of work to fetch
     * @param contentFilter The mature/explicit/etc. content filter to apply
     */
    public fetchAllNew(pageNum: number, kinds: ContentKind[], contentFilter: ContentFilter) {
        const kindFragment = kinds.map((k) => `&kind=${k}`).join('');
        const route = `${this.baseUrl}/browse/fetch-all-new?filter=${contentFilter}&pageNum=${pageNum}${kindFragment}`;

        return handleResponse(
            this.http.get<PaginateResult<ContentModel>>(route, { observe: 'response', withCredentials: true }),
        );
    }

    /**
     * Search for the given query, and return the top 3 results in Works, Blogs, and Users.
     * @param query The user's search string.
     */
    public searchInitialResults(query: string): Observable<InitialResults> {
        return handleResponse(
            this.http.get<InitialResults>(`${this.baseUrl}/search/get-initial-results?query=${query}`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    public searchWorks(query: string, pageNum: number): Observable<PaginateResult<ContentModel>> {
        return handleResponse(
            this.http.get<PaginateResult<ContentModel>>(
                `${this.baseUrl}/search/get-work-results?query=${query}&pageNum=${pageNum}`,
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    public searchBlogs(query: string, pageNum: number): Observable<PaginateResult<ContentModel>> {
        return handleResponse(
            this.http.get<PaginateResult<ContentModel>>(
                `${this.baseUrl}/search/get-blog-results?query=${query}&pageNum=${pageNum}`,
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    public searchUsers(query: string, pageNum: number): Observable<PaginateResult<User>> {
        return handleResponse(
            this.http.get<PaginateResult<User>>(
                `${this.baseUrl}/search/get-user-results?query=${query}&pageNum=${pageNum}`,
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    //#endregion

    //#region ---CASE FILES---

    /**
     * Fetches all active case files.
     */
    public fetchActiveCaseFiles() {
        return handleResponse(
            this.http.get<CaseFile[]>(`${this.baseUrl}/case-files/fetch-active`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Fetches all closed case files.
     */
    public fetchClosedCaseFiles() {
        return handleResponse(
            this.http.get<CaseFile[]>(`${this.baseUrl}/case-files/fetch-closed`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Submits a report on a given item.
     * @param itemId
     * @param caseKind
     * @param form
     */
    public submitReport(itemId: string, caseKind: CaseKind, form: ReportForm) {
        return handleResponse(
            this.http.put<void>(
                `${this.baseUrl}/case-files/submit-report?itemId=${itemId}&caseKind=${caseKind}`,
                form,
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    /**
     * Claims a file.
     * @param id
     */
    public claimFile(id: number) {
        return handleResponse(
            this.http.patch<CaseFile>(
                `${this.baseUrl}/case-files/claim-file?id=${id}`,
                {},
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    /**
     * Revokes a claim.
     * @param id
     */
    public revokeClaim(id: number) {
        return handleResponse(
            this.http.patch<CaseFile>(
                `${this.baseUrl}/case-files/revoke-claim?id=${id}`,
                {},
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    /**
     * Adds a note to an existing case file.
     * @param id
     * @param form
     */
    public addNote(id: number, form: NoteForm) {
        return handleResponse(
            this.http.patch<Note>(`${this.baseUrl}/case-files/add-note?id=${id}`, form, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    //#endregion

    //#region ---COLLECTIONS---

    /**
     * Creates a collection in the database.
     *
     * @param collInfo A collection's info
     */
    public createCollection(collInfo: CollectionForm) {
        return handleResponse(
            this.http.put<Collection>(`${this.baseUrl}/collections/create-collection`, collInfo, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Fetches a user's collections.
     */
    public fetchAllCollections(pageNum: number) {
        return handleResponse(
            this.http.get<PaginateResult<Collection>>(
                `${this.baseUrl}/collections/get-all-collections?pageNum=${pageNum}`,
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    /**
     * Fetches one collection for the logged-in user. Can retrieve both public and private collections.
     * @param collId The ID of the collection to fetch.
     */
    public fetchOneCollection(collId: string): Observable<Collection> {
        return handleResponse(
            this.http.get<Collection>(`${this.baseUrl}/collections/get-one-collection?collId=${collId}`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Fetches one collection for a user. Will only look for private collections.
     * @param userId The ID of the user that owns the collection.
     * @param collId The collection's ID.
     */
    public fetchOnePublicCollection(userId: string, collId: string): Observable<Collection> {
        return handleResponse(
            this.http.get<Collection>(
                `${this.baseUrl}/collections/get-one-public-collection?userId=${userId}&collId=${collId}`,
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    /**
     * Fetches all the collections that are public for a given user.
     * @param userId The ID of the user whose collections will be fetched.
     * @param pageNum The page number to fetch.
     */
    public fetchPublicCollections(userId: string, pageNum: number) {
        return handleResponse(
            this.http.get<PaginateResult<Collection>>(
                `${this.baseUrl}/collections/get-public-collections?userId=${userId}&pageNum=${pageNum}`,
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    /**
     * Fetches a user's collections without pagination.
     */
    public fetchAllCollectionsNoPaginate() {
        return handleResponse(
            this.http.get<Collection[]>(`${this.baseUrl}/collections/get-all-collections-no-paginate`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Sends edits for a collection to the database.
     *
     * @param collId A collection's ID
     * @param collInfo The new collection info
     */
    public editCollection(collId: string, collInfo: CollectionForm) {
        return handleResponse(
            this.http.patch<Collection>(`${this.baseUrl}/collections/edit-collection?collId=${collId}`, collInfo, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Deletes a collection belonging to this user.
     *
     * @param collId The collection ID
     */
    public deleteCollection(collId: string) {
        return handleResponse(
            this.http.patch<void>(
                `${this.baseUrl}/collections/delete-collection?collId=${collId}`,
                {},
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    /**
     * Adds a work to a collection.
     *
     * @param collId The collection
     * @param workId The work
     */
    public addWorkToCollection(collId: string, workId: string) {
        return handleResponse(
            this.http.patch<void>(
                `${this.baseUrl}/collections/add-content?collId=${collId}&contentId=${workId}`,
                {},
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    /**
     * Removes a work from a collection.
     *
     * @param collId The collection
     * @param workId The work
     */
    public removeWorkFromCollection(collId: string, workId: string) {
        return handleResponse(
            this.http.patch<void>(
                `${this.baseUrl}/collections/remove-content?collId=${collId}&contentId=${workId}`,
                {},
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    /**
     * Sends a request to set a collection to public to the backend.
     *
     * @param collId The collection's ID
     */
    public setCollectionToPublic(collId: string) {
        return handleResponse(
            this.http.patch<void>(
                `${this.baseUrl}/collections/set-public?collId=${collId}`,
                {},
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    /**
     * Sends a request to set a collection to private to the backend.
     *
     * @param collId The collection's ID
     */
    public setCollectionToPrivate(collId: string) {
        return handleResponse(
            this.http.patch<void>(
                `${this.baseUrl}/collections/set-private?collId=${collId}`,
                {},
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    //#endregion

    //#region ---COMMENTS---

    /**
     * Adds a comment.
     * @param itemId
     * @param kind
     * @param commentInfo
     * @returns
     */
    public addComment(itemId: string, kind: CommentKind, commentInfo: CommentForm) {
        return handleResponse(
            this.http.put<Comment>(`${this.baseUrl}/comments/add-comment?itemId=${itemId}&kind=${kind}`, commentInfo, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Fetches a new page of comments
     * @param contentId
     * @param pageNum
     * @returns
     */
    public fetchComments(itemId: string, kind: CommentKind, pageNum: number) {
        return handleResponse(
            this.http.get<PaginateResult<Comment>>(
                `${this.baseUrl}/comments/fetch-comments?itemId=${itemId}&kind=${kind}&page=${pageNum}`,
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    /**
     * Edits a comment.
     * @param id The comment to edit
     * @param commentInfo The new info about it
     */
    public editComment(id: string, commentInfo: CommentForm) {
        return handleResponse(
            this.http.patch(`${this.baseUrl}/comments/edit-comment?id=${id}`, commentInfo, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    //#endregion

    //#region ---CONTENT---

    /**
     * Fetches one piece of published content from the API.
     *
     * @param contentId The content ID
     * @param kind The content kind
     */
    public fetchContent(contentId: string, kind: ContentKind, page: number): Observable<PubContent> {
        return handleResponse(
            this.http.get<PubContent>(
                `${this.baseUrl}/content/fetch-one-published?contentId=${contentId}&kind=${kind}&page=${page}`,
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    /**
     * Finds a related reading history document, provided the `contentId`. Creates one if none exist, or
     * updates an existing one if something is found.
     *
     * @param contentId The related content
     */
    public fetchRelatedHistory(contentId: string): Observable<ReadingHistory> {
        return handleResponse(
            this.http.post<ReadingHistory>(
                `${this.baseUrl}/history/add-or-update-history/${contentId}`,
                {},
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    /**
     * Fetches all published content from the API that matches the provided `kinds`. Optionally filters
     * the results by a provided `userId`.
     *
     * @param pageNum The current page
     * @param kinds The kinds of content to include
     * @param contentFilter The rating filter to apply to the retrieval
     * @param userId (Optional) The author of this content
     */
    public fetchAllContent(
        pageNum: number,
        kinds: ContentKind[],
        contentFilter: ContentFilter,
        userId?: string,
    ): Observable<PaginateResult<ContentModel>> {
        let route = ``;

        // If we just include the kind array as-is, it'll be serialized as "&kind=Kind1,Kind2" which the backend will interpret as
        // the string 'Kind1,Kind2' which is not what we want. So, we manually split it out into a query string
        // which becomes "&kind=Kind1&kind=Kind2", etc.
        const kindFragment = kinds.map((k) => `&kind=${k}`).join('');
        if (userId) {
            route = `${this.baseUrl}/content/fetch-all-published?filter=${contentFilter}&pageNum=${pageNum}&userId=${userId}${kindFragment}`;
        } else {
            route = `${this.baseUrl}/content/fetch-all-published?filter=${contentFilter}&pageNum=${pageNum}${kindFragment}`;
        }

        return handleResponse(
            this.http.get<PaginateResult<ContentModel>>(route, { observe: 'response', withCredentials: true }),
        );
    }

    /**
     * Fetches one section from the API using the provided `sectionID`.
     *
     * @param sectionId The section ID
     */
    public fetchSection(sectionId: string): Observable<Section> {
        return handleResponse(
            this.http.get<Section>(`${this.baseUrl}/sections/fetch-one-by-id?sectionId=${sectionId}&published=true`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Sets a user's rating to Liked.
     *
     * @param setRating Information to set the new rating
     */
    public setLike(setRating: SetRating): Observable<ReadingHistory> {
        return handleResponse(
            this.http.patch<ReadingHistory>(`${this.baseUrl}/content/set-like`, setRating, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Sets a user's rating to Disliked.
     *
     * @param setRating Information to set the new rating
     */
    public setDislike(setRating: SetRating): Observable<ReadingHistory> {
        return handleResponse(
            this.http.patch<ReadingHistory>(`${this.baseUrl}/content/set-dislike`, setRating, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Sets a user's rating to NoVote.
     *
     * @param setRating Information to set the new rating
     */
    public setNoVote(setRating: SetRating): Observable<ReadingHistory> {
        return handleResponse(
            this.http.patch<ReadingHistory>(`${this.baseUrl}/content/set-no-vote`, setRating, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    //#endregion

    //#region ---COVER ART & AVATARS---

    /**
     * Uses the given uploader to an image up to the server. Attempts to cast
     * the server's response into a T and return it.
     *
     * @param uploader The file uploader, prefilled with the URL and instructions for uploading the image.
     */
    public changeImage<T extends FrontendUser | ContentModel>(uploader: FileUploader): Observable<T> {
        const xsrfHeader = uploader.options.headers.find((x) => x.name.toUpperCase() === 'XSRF-TOKEN');
        const currentXsrfToken = this.cookieService.get('XSRF-TOKEN') ?? '';
        if (!xsrfHeader) {
            uploader.options.headers.push({ name: 'XSRF-TOKEN', value: currentXsrfToken });
        } else {
            xsrfHeader.value = currentXsrfToken;
        }
        return new Observable<T>((observer) => {
            uploader.onCompleteItem = (
                _: FileItem,
                response: string,
                status: number,
                headers: ParsedResponseHeaders,
            ) => {
                if (status !== 201) {
                    const errorMessage: HttpError = tryParseJsonHttpError(response);
                    if (!errorMessage) {
                        const juryRiggedError: HttpError = {
                            statusCode: status,
                            error: response,
                        };
                        return observer.error(juryRiggedError);
                    } else {
                        return observer.error(errorMessage);
                    }
                }

                // Normally, our midleware handles this, but since we're handling the token manually here,
                // we need to set up the next token manually as well.
                const newXsrfToken = headers['XSRF-TOKEN'];
                if (newXsrfToken) {
                    this.cookieService.put('XSRF-TOKEN', newXsrfToken);
                }
                const work: T = JSON.parse(response);
                observer.next(work);
                observer.complete();
            };

            uploader.uploadAll();
        });
    }

    //#endregion

    //#region ---HISTORY---

    /**
     * Fetches a user's entire history, paginated.
     */
    public fetchUserHistory(): Observable<ReadingHistory[]> {
        return handleResponse(
            this.http.get<ReadingHistory[]>(`${this.baseUrl}/history/fetch-user-history`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Fetches one history doc without updating the viewedOn date.
     */
    public fetchOneHistDoc(workId: string): Observable<ReadingHistory> {
        return handleResponse(
            this.http.get<ReadingHistory>(`${this.baseUrl}/history/fetch-one-hist-doc/${workId}`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Adds a new history document, or updates an existing one.
     *
     * @param workId The work to parse
     */
    public addOrUpdateHistory(workId: string): Observable<ReadingHistory> {
        return handleResponse(
            this.http.post<ReadingHistory>(
                `${this.baseUrl}/history/add-or-update-history/${workId}`,
                {},
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    /**
     * Soft deletes a history doc by setting its visibility to false.
     *
     * @param histIds The ID of the history document
     */
    public changeHistoryVisibility(histIds: string[]): Observable<void> {
        return handleResponse(
            this.http.patch<void>(
                `${this.baseUrl}/history/change-visibility`,
                { histIds: histIds },
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    //#endregion

    //#region ---MESSAGES---

    /**
     * Fetches a user's threads.
     */
    public fetchUserThreads(pageNum: number) {
        return handleResponse(
            this.http.get<PaginateResult<MessageThread>>(`${this.baseUrl}/messages/fetch-user--threads/${pageNum}`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Fetches a user's threads for the sidenav.
     */
    public fetchUserSidenavThreads() {
        return handleResponse(
            this.http.get<MessageThread[]>(`${this.baseUrl}/messages/fetch-user-sidenav-threads`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Creates a new thread with a single message, directed towards one user.
     *
     * @param initialMessage The initial message of the thread
     */
    public createNewPrivateThread(initialMessage: CreateInitialMessage) {
        return handleResponse(
            this.http.put<void>(`${this.baseUrl}/messages/create-new-private-thread`, initialMessage, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Responds to a single thread.
     *
     * @param response A new response
     */
    public createResponse(response: CreateResponse) {
        return handleResponse(
            this.http.put<void>(`${this.baseUrl}/messages/create-response`, response, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    //#endregion

    //#region ---MY STUFF---

    /**
     * Fetches one piece of content from the backend.
     *
     * @param contentId The content to fetch
     * @param kind The content kind
     * @returns Observable
     */
    public fetchOne(contentId: string, kind: ContentKind): Observable<ContentModel> {
        return handleResponse(
            this.http.get<ContentModel>(`${this.baseUrl}/content/fetch-one?contentId=${contentId}&kind=${kind}`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Fetches all files related to the current user from the backend.
     *
     * @returns Observable
     */
    public fetchAll(): Observable<ContentModel[]> {
        return handleResponse(
            this.http.get<ContentModel[]>(`${this.baseUrl}/content/fetch-all`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Sends a request to create a piece of content to the backend, with the route determined by its
     * `ContentKind`.
     *
     * @param kind The content kind
     * @param formInfo The form information
     */
    public createContent(kind: ContentKind, formInfo: FormType): Observable<ContentModel> {
        return handleResponse(
            this.http.put<ContentModel>(`${this.baseUrl}/content/create-one?kind=${kind}`, formInfo, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Sends a request to create a piece of content to the backend, with the route determined by its
     * `ContentKind`.
     *
     * @param contentId The current content's ID
     * @param kind The content kind
     * @param formInfo The form information
     */
    public saveContent(contentId: string, kind: ContentKind, formInfo: FormType): Observable<ContentModel> {
        return handleResponse(
            this.http.patch<ContentModel>(
                `${this.baseUrl}/content/save-changes?contentId=${contentId}&kind=${kind}`,
                formInfo,
                {
                    observe: 'response',
                    withCredentials: true,
                },
            ),
        );
    }

    /**
     * Sends a request to delete the specified content.
     *
     * @param contentId The content to delete
     * @returns Observable
     */
    public deleteOne(contentId: string): Observable<void> {
        return handleResponse(
            this.http.patch<void>(
                `${this.baseUrl}/content/delete-one?contentId=${contentId}`,
                {},
                {
                    observe: 'response',
                    withCredentials: true,
                },
            ),
        );
    }

    /**
     * Sends a request to publish the specified content.
     *
     * @param contentId The content to publish
     * @param pubChange (Optional) Used for blog and newspost publishing changes
     * @returns Observable
     */
    public publishOne(contentId: string, pubChange?: PubChange): Observable<ContentModel> {
        return handleResponse(
            this.http.patch<ContentModel>(`${this.baseUrl}/content/publish-one?contentId=${contentId}`, pubChange, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Fetches the sections belonging to the specified piece of content given its ID.
     *
     * @param contentId The content ID
     */
    public fetchSections(contentId: string): Observable<Section[]> {
        return handleResponse(
            this.http.get<Section[]>(`${this.baseUrl}/sections/fetch-user-content-sections?contentId=${contentId}`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Sends a request to create a new section for the specified piece of content, given the content's ID
     * and the new section info.
     *
     * @param contentId The content ID
     * @param sectionInfo The info for the new section
     */
    public createSection(contentId: string, sectionInfo: SectionForm): Observable<Section> {
        return handleResponse(
            this.http.put<Section>(`${this.baseUrl}/sections/create-section?contentId=${contentId}`, sectionInfo, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Sends a request to save any edits to the specified section, belonging to the specified content.
     *
     * @param contentId The content ID
     * @param sectionId The section ID
     * @param sectionInfo The info to save
     */
    public editSection(contentId: string, sectionId: string, sectionInfo: SectionForm): Observable<Section> {
        return handleResponse(
            this.http.patch<Section>(
                `${this.baseUrl}/sections/edit-section?contentId=${contentId}&sectionId=${sectionId}`,
                sectionInfo,
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    // Tempoary method. If it's still around by 2021-08-07, delete it. -PingZing
    public migrateQuillSection(
        authorId: string,
        contentId: string,
        sectionId: string,
        sectionInfo: SectionForm,
    ): Observable<Section> {
        return handleResponse(
            this.http.patch<Section>(
                `${this.baseUrl}/sections/migrate-quill-section?authorId=${authorId}&contentId=${contentId}&sectionId=${sectionId}`,
                sectionInfo,
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    // Temporary method. If it's still around by 2021-08-7, delete it. - PingZing
    public migrateQuillLongDesc(contentId: string, editForm: FormType): Observable<ContentModel> {
        return handleResponse(
            this.http.patch<ContentModel>(
                `${this.baseUrl}/content/migrate-quill-long-desc?contentId=${contentId}`,
                editForm,
                { observe: 'response', withCredentials: true }
            ),
        );
    }

    /**
     * Sends a request to delete the specified section, belonging to the specified content.
     *
     * @param contentId The content ID
     * @param sectionId The section ID
     */
    public deleteSection(contentId: string, sectionId: string): Observable<Section> {
        return handleResponse(
            this.http.patch<Section>(
                `${this.baseUrl}/sections/delete-section?contentId=${contentId}&sectionId=${sectionId}`,
                {},
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    /**
     * Sends a request to flip the current publishing status of the specified section.
     *
     * @param contentId The content ID
     * @param sectionId The section ID
     * @param pubStatus The publishing status
     */
    public publishSection(contentId: string, sectionId: string, pubStatus: PublishSection): Observable<Section> {
        return handleResponse(
            this.http.patch<Section>(
                `${this.baseUrl}/sections/publish-section?contentId=${contentId}&sectionId=${sectionId}`,
                pubStatus,
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    //#endregion

    //#region ---NEWS CONSUMPTION--

    /**
     * Gets the inital posts for the home page.
     */
    public fetchInitialNewsPosts(): Observable<NewsContentModel[]> {
        return handleResponse(
            this.http.get<NewsContentModel[]>(`${this.baseUrl}/news/initial-posts`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Fetches a page of news results.
     *
     * @param pageNum The current page
     */
    public fetchNewsFeed(pageNum: number): Observable<PaginateResult<NewsContentModel>> {
        return handleResponse(
            this.http.get<PaginateResult<NewsContentModel>>(`${this.baseUrl}/news/news-feed/${pageNum}`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Grabs one newspost from the database.
     *
     * @param postId The post to fetch
     */
    public fetchNewsPost(postId: string) {
        return handleResponse(
            this.http.get<NewsContentModel>(`${this.baseUrl}/news/news-post/${postId}`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    //#endregion

    //#region ---NOTIFICATIONS---

    /**
     * Gets all of the current user's notifications.
     */
    public fetchAllNotifications(): Observable<NotificationBase[]> {
        return handleResponse(
            this.http.get<NotificationBase[]>(`${this.baseUrl}/notifications/all-notifications`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Gets all of the current user's _unread_ notifications.
     */
    public fetchUnreadNotifications(): Observable<NotificationBase[]> {
        return handleResponse(
            this.http.get<NotificationBase[]>(`${this.baseUrl}/notifications/unread-notifications`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Marks the given notifications as read.
     * @param toMark A list of notification IDs to mark as read.
     */
    public markNotificationsAsRead(toMark: MarkReadRequest): Observable<void> {
        return handleResponse(
            this.http.post<void>(`${this.baseUrl}/notifications/mark-as-read`, toMark, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Gets a list of all the things the current user is subscribed to notifications for.
     */
    public fetchNotificationSubscriptions(): Observable<NotificationSubscription[]> {
        return handleResponse(
            this.http.get<NotificationSubscription[]>(`${this.baseUrl}/notifications/unread-notifications`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Subscribe to notifications on the source with the given ID.
     * @param sourceId ID of the thing to subscribe to notifications for.
     */
    public subscribeToNotifications(sourceId: string): Observable<void> {
        return handleResponse(
            this.http.post<void>(
                `${this.baseUrl}/notifications/subscribe?sourceId=${sourceId}`,
                {},
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    /**
     * Unsubscribe to notifications on the source with the given ID.
     * @param sourceId ID of the thing to unsubscribe from.
     */
    public unsubscribeFromNotifications(sourceId: string): Observable<void> {
        return handleResponse(
            this.http.post<void>(
                `${this.baseUrl}/notifications/unsubscribe?sourceId=${sourceId}`,
                {},
                { observe: 'response', withCredentials: true },
            ),
        );
    }

    //#endregion

    //#region ---RATINGS---

    public addOrFetchRatings(contentId: string) {
        return handleResponse(
            this.http.get<RatingsModel>(`${this.baseUrl}/ratings/add-or-fetch-ratings?contentId=${contentId}`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    public addLike(contentId: string) {
        return handleResponse(
            this.http.patch<RatingsModel>(
                `${this.baseUrl}/ratings/add-like?contentId=${contentId}`,
                {},
                {
                    observe: 'response',
                    withCredentials: true,
                },
            ),
        );
    }

    public addDislike(contentId: string) {
        return handleResponse(
            this.http.patch<RatingsModel>(
                `${this.baseUrl}/ratings/add-dislike?contentId=${contentId}`,
                {},
                {
                    observe: 'response',
                    withCredentials: true,
                },
            ),
        );
    }

    public removeVote(contentId: string) {
        return handleResponse(
            this.http.patch<RatingsModel>(
                `${this.baseUrl}/ratings/set-no-vote?contentId=${contentId}`,
                {},
                {
                    observe: 'response',
                    withCredentials: true,
                },
            ),
        );
    }

    //#endregion

    //#region ---SERVER-SENT EVENTS---

    /**
     * Gets the server-sent events given a URl.
     * @param url
     * @returns
     */
    public getServerSentEvent<T>(url: string): Observable<MessageEvent<T>> {
        return new Observable<MessageEvent<T>>((observer) => {
            const eventSource = new EventSource(url);
            eventSource.onmessage = (event: MessageEvent<T>) => {
                this._zone.run(() => {
                    observer.next(event);
                });
            };
            eventSource.onerror = (error) => {
                this._zone.run(() => {
                    observer.error(error);
                });
            };
        });
    }

    //#endregion

    //#region ---STATS---

    /**
     * Fetches the stats for the footer.
     */
    public fetchFrontPageStats() {
        return handleResponse(
            this.http.get<FrontPageStats>(`${this.baseUrl}/meta/public-stats`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    //#endregion

    //#region ---USER---

    /**
     * Fetches the user whose portfolio the request belongs to.
     *
     * @param userId The user ID of a requested portfolio
     */
    public fetchUserInfo(userId: string): Observable<FrontendUser> {
        return handleResponse(
            this.http.get<FrontendUser>(`${this.baseUrl}/user/get-user-info/${userId}`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Fetches a specified user's profile for the portfolio home page.
     *
     * @param userId The user whose profile should be retrieved
     * @param contentFilter The rating filter to apply to the user's content
     */
    public fetchUserProfile(
        userId: string,
        contentFilter: ContentFilter,
    ): Observable<{ works: ContentModel[]; blogs: ContentModel[] }> {
        return handleResponse(
            this.http.get<{ works: ContentModel[]; blogs: ContentModel[] }>(
                `${this.baseUrl}/user/get-user-profile?userId=${userId}&filter=${contentFilter}`,
                {
                    observe: 'response',
                    withCredentials: true,
                },
            ),
        );
    }

    /**
     * Sends a request to change a user's email.
     *
     * @param newEmail The requested new email and current password.
     */
    public changeEmail(newEmail: ChangeEmail): Observable<FrontendUser> {
        return handleResponse(
            this.http.patch<FrontendUser>(`${this.baseUrl}/user/change-email`, newEmail, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Sends a request to change a user's username.
     *
     * @param newUsername The reuqested new username and current password.
     */
    public changeUsername(newUsername: ChangeUsername): Observable<FrontendUser> {
        return handleResponse(
            this.http.patch<FrontendUser>(`${this.baseUrl}/user/change-username`, newUsername, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Sends a request to change a user's password.
     *
     * @param newPasswordInfo The new password requested
     */
    public changePassword(newPasswordInfo: ChangePassword): Observable<FrontendUser> {
        return handleResponse(
            this.http.patch<FrontendUser>(`${this.baseUrl}/user/change-password`, newPasswordInfo, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Sends a request to change a user's bio.
     *
     * @param newBioInfo The new profile info requested
     */
    public changeBio(newBioInfo: ChangeBio): Observable<FrontendUser> {
        return handleResponse(
            this.http.patch<FrontendUser>(`${this.baseUrl}/user/update-bio`, newBioInfo, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Sends a message to the server instructing it to set the user's
     * 'agreedToPolicies' field to true. On success, returns the updated
     * user object.
     */
    public agreeToPolicies(): Observable<FrontendUser> {
        return handleResponse(
            this.http.post<FrontendUser>(`${this.baseUrl}/user/agree-to-policies`, null, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Updates a user's tagline.
     *
     * @param tagline The new tagline
     */
    public updateTagline(tagline: UpdateTagline): Observable<FrontendUser> {
        return handleResponse(
            this.http.patch<FrontendUser>(`${this.baseUrl}/user/update-tagline`, tagline, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    /**
     * Generates a new invite code.
     */
    public generateCode() {
        return handleResponse(
            this.http.get<InviteCodes>(`${this.baseUrl}/user-management/generate-code`, {
                observe: 'response',
                withCredentials: true,
            }),
        );
    }

    //#endregion
}
