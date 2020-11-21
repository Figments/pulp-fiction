import { Schema, Prop, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { generate } from 'shortid';

import { Section, AuthorsNotePos } from '@pulp-fiction/models/sections';

@Schema({timestamps: true, autoIndex: true, collection: 'sections'})
export class SectionsDocument extends Document implements Section {
    @Prop({default: generate()})
    readonly _id: string;

    @Prop({trim: true, required: true})
    title: string;

    @Prop({trim: true, required: true})
    body: string;

    @Prop({trim: true})
    authorsNote?: string;

    @Prop({type: String, enum: Object.keys(AuthorsNotePos), default: AuthorsNotePos.Bottom})
    authorsNotePos?: AuthorsNotePos;

    @Prop({default: false})
    published: boolean;

    @Prop(raw({
        words: {type: Number, default: 0}
    }))
    stats: {
        words: number;
    };

    @Prop(raw({
        publishedOn: {type: Date, default: null},
        isDeleted: {type: Boolean, default: false}
    }))
    audit: {
        publishedOn: Date;
        isDeleted: boolean;
    };

    @Prop({default: false})
    usesNewEditor: boolean; // this gets removed after QuillJS is nuked from orbit

    @Prop({default: Date.now()})
    createdAt: Date;

    @Prop({default: Date.now()})
    updatedAt: Date;
}

export const SectionsSchema = SchemaFactory.createForClass(SectionsDocument);