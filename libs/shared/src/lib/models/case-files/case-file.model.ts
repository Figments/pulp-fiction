import { CaseKind } from './case-kind.enum';
import { Report } from './reports.model';
import { Note } from './notes.model';
import { FrontendUser } from '@dragonfish/shared/models/users';
import { Comment } from '@dragonfish/shared/models/comments';
import { ContentModel } from '@dragonfish/shared/models/content';
import { ActionType } from './action.type';

export interface CaseFile {
    readonly _id: number;
    reports: Report[];
    notes: Note[];
    isClosed: boolean;
    claimedBy: string | FrontendUser;
    action: {
        hasType: ActionType;
        date: Date;
        reason: string;
    };
    readonly kind: CaseKind;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export interface ContentCaseFile extends CaseFile {
    content: string | ContentModel;
}

export interface CommentCaseFile extends CaseFile {
    comment: string | Comment;
}

export interface UserCaseFile extends CaseFile {
    user: string | FrontendUser;
}
