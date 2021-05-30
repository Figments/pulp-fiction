import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Report, ReportReason } from '@dragonfish/shared/models/case-files';

@Schema({ timestamps: true, autoIndex: true, _id: false })
export class ReportDocument extends Types.Subdocument implements Report {
    @Prop({ type: Number })
    readonly _id: number;

    @Prop({ type: String, ref: 'User', required: true })
    readonly user: string;

    @Prop({ type: [String], enum: Object.keys(ReportReason), required: true })
    reasons: ReportReason[];

    @Prop({ trim: true, required: true })
    body: string;

    @Prop()
    readonly createdAt: Date;

    @Prop(0)
    readonly updatedAt: Date;
}

export const ReportSchema = SchemaFactory.createForClass(ReportDocument);
