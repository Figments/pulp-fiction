import { NotificationKind } from './notification-kind';

export interface Notification {
    _id: string;

    /**
     * The ID of the user this notification was sent to.
     */
    destinationUserId: string;

    /**
     * The ID of the thing (Work, Document, Blog, etc) that triggered this notification.
     */
    sourceId: string;
    
    /**
     * The ID of the notification source's parent (i.e. if the notification
     * was triggered by a Section, this will be the parent Work's ID).
     * Undefined if the source doesn't have a parent.
     */
    sourceParentId?: string | undefined;
    kind: NotificationKind;
    title: string;
    body?: string | undefined;
    createdAt: Date;
    updatedAt: Date;
}