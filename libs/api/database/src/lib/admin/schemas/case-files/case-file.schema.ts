import { Schema, Prop, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ActionType, CaseFile, CaseKind } from '@dragonfish/shared/models/case-files';
import { FrontendUser } from '@dragonfish/shared/models/users';
import { ReportDocument, ReportSchema } from './reports.schema';
import { NotesDocument, NotesSchema } from './notes.schema';

@Schema({ timestamps: true, autoIndex: true, collection: 'case_files', discriminatorKey: 'kind', _id: false })
export class CaseFileDocument extends Document implements CaseFile {
    @Prop({ type: Number })
    readonly _id: number;

    @Prop({ type: [ReportSchema], default: [] })
    reports: ReportDocument[];

    @Prop({ type: [NotesSchema], default: [] })
    notes: NotesDocument[];

    @Prop({ default: false })
    isClosed: boolean;

    @Prop({
        type: String,
        ref: 'User',
        autopopulate: {
            select: '-password -email -audit.sessions -audit.termsAgree -audit.emailConfirmed -audit.deleted -updatedAt',
        },
        default: null,
    })
    claimedBy: string | FrontendUser;

    @Prop(
        raw({
            hasType: { type: String, enum: Object.keys(ActionType), default: ActionType.None },
            date: { type: Date, default: null },
            reason: { type: String, default: null },
        }),
    )
    action: {
        hasType: ActionType;
        date: Date;
        reason: string;
    };

    @Prop({ type: String, enum: Object.keys(CaseKind), required: true })
    readonly kind: CaseKind;

    @Prop()
    readonly createdAt: Date;

    @Prop()
    readonly updatedAt: Date;
}

export const CaseFileSchema = SchemaFactory.createForClass(CaseFileDocument);
