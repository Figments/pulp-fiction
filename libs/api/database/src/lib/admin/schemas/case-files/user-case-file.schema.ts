import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ActionType, CaseKind, UserCaseFile } from '@dragonfish/shared/models/case-files';
import { FrontendUser } from '@dragonfish/shared/models/users';
import { ReportDocument } from './reports.schema';
import { NotesDocument } from './notes.schema';

@Schema()
export class UserCaseFileDocument extends Document implements UserCaseFile {
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

    @Prop({
        type: String,
        ref: 'User',
        autopopulate: {
            select: '-password -email -audit.sessions -audit.termsAgree -audit.emailConfirmed -audit.deleted -updatedAt',
        },
        required: true,
    })
    user: string | FrontendUser;
}

export const UserCaseFileSchema = SchemaFactory.createForClass(UserCaseFileDocument);
