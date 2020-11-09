import { NotificationSourceKind } from './notification-source-kind';

export interface CreateNotification {
    /**
     * The ID of the thing (Work, Document, Blog, etc) that triggered this notification.
     */
    sourceId: string;
    sourceKind: NotificationSourceKind;

    /**
     * The ID of the notification source's parent (i.e. if the notification
     * was triggered by a Section, this will be the parent Work's ID).
     * Undefined if the source doesn't have a parent.
     */
    sourceParentId?: string;
    sourceParentKind?: NotificationSourceKind | undefined;    
    title: string;
    body?: string | undefined;
}