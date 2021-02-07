import { PaginateResult } from 'mongoose';
import { ApprovalQueue } from '@dragonfish/models/approval-queue';
import { ContentKind, ContentModel } from '@dragonfish/models/content';
import { JwtPayload } from '@dragonfish/models/auth';

/**
 * ## The Approval Queue Interface
 *
 * Implement this interface to be able to serve these routes data.
 */
export interface IApprovalQueue {
    /**
     * Fetches the current page of the approval queue.
     *
     * @param pageNum The current page
     */
    getQueue(pageNum: number): Promise<PaginateResult<ApprovalQueue>>;

    /**
     * Fetches a single piece of content associated with the provided content ID and
     * user ID.
     *
     * @param contentId The content to view
     * @param kind The content's kind
     * @param userId The author of the content
     */
    viewContent(contentId: string, kind: ContentKind, userId: string): Promise<ContentModel>;

    /**
     * Claims a piece of content from the queue.
     *
     * @param user The staff user claiming the content
     * @param docId The approval queue document
     */
    claimContent(user: JwtPayload, docId: string): Promise<ApprovalQueue>;

    /**
     * Approves a piece of content for publishing.
     *
     * @param user The staff user making this decision
     * @param docId The approval queue document
     * @param contentId The content ID
     * @param authorId The author ID
     */
    approveContent(user: JwtPayload, docId: string, contentId: string, authorId: string): Promise<void>;

    /**
     * Rejects a piece of content for publishing.
     *
     * @param user The staff user making this decision
     * @param docId The approval queue document
     * @param contentId The content ID
     * @param authorId The author ID
     */
    rejectContent(user: JwtPayload, docId: string, contentId: string, authorId: string): Promise<void>;
}
