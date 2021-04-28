import { NewsPostNotificationInfo } from '@dragonfish/shared/models/notifications';
import { NotificationQueueDocument } from '../notification-queue.schema';

export interface NewsPostNotificationQueueDocument extends NotificationQueueDocument, NewsPostNotificationInfo {
    readonly _id?: string;
}
