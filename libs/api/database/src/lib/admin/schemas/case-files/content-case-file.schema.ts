import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ActionType, ContentCaseFile, CaseKind } from '@dragonfish/shared/models/case-files';
import { FrontendUser } from '@dragonfish/shared/models/users';
import { ReportDocument } from './reports.schema';
import { NotesDocument } from './notes.schema';
import { ContentModel } from '@dragonfish/shared/models/content';

@Schema()
export class ContentCaseFileDocument extends Document implements ContentCaseFile {
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

    @Prop({ type: String, ref: 'Content', autopopulate: true, required: true })
    content: string | ContentModel;
}

export const ContentCaseFileSchema = SchemaFactory.createForClass(ContentCaseFileDocument);
