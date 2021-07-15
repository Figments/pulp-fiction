import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ActionType, CaseKind, CommentCaseFile } from '@dragonfish/shared/models/case-files';
import { FrontendUser } from '@dragonfish/shared/models/users';
import { ReportDocument } from './reports.schema';
import { NotesDocument } from './notes.schema';
import { Comment } from '@dragonfish/shared/models/comments';

@Schema()
export class CommentCaseFileDocument extends Document implements CommentCaseFile {
    readonly _id: number;
    reports: ReportDocument[];
    notes: NotesDocument[];
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

    @Prop({ type: String, ref: 'Comments', autopopulate: true, required: true })
    comment: string | Comment;
}

export const CommentCaseFileSchema = SchemaFactory.createForClass(CommentCaseFileDocument);
