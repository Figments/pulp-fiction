import { Schema, HookNextFunction, model } from 'mongoose';
import * as MongooseAutopopulate from 'mongoose-autopopulate';
import * as MongoosePaginate from 'mongoose-paginate-v2';
import * as sanitizeHtml from 'sanitize-html';
import { nanoid } from 'nanoid';

import { CommentDocument } from './models';
import { ContentAction } from '@dragonfish/shared/models/comments';

export const CommentHistorySchema = new Schema({
    oldBody: { type: String, required: true, trim: true },
    editedOn: { type: Date, default: Date.now() },
});

export const CommentsSchema = new Schema(
    {
        _id: { type: String, default: () => nanoid() },
        user: {
            type: String,
            ref: 'User',
            required: true,
            index: true,
            autopopulate: {
                select: '_id username profile.avatar profile.tagline audit.roles',
            },
        },
        body: { type: String, required: true, trim: true },
        replies: { type: [String], default: null },
        stats: {
            likes: { type: Number, default: 0 },
            dislikes: { type: Number, default: 0 },
        },
        history: { type: [CommentHistorySchema], default: null },
        audit: {
            isActioned: { type: Boolean, default: false },
            canEdit: { type: Boolean, default: true },
            action: { type: String, enum: Object.keys(ContentAction), default: 'NoAction' },
            actionReason: { type: String, default: 'Created' },
            actionedBy: {
                type: String,
                ref: 'User',
                default: null,
                autopopulate: {
                    select: '_id username audit.roles',
                },
            },
        },
        isEditing: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now() },
        updatedAt: { type: Date, default: Date.now() },
    },
    { discriminatorKey: 'kind', autoIndex: true, timestamps: true, collection: 'comments' }
);

CommentsSchema.plugin(MongooseAutopopulate);
CommentsSchema.plugin(MongoosePaginate);

CommentsSchema.pre<CommentDocument>('save', async function (next: HookNextFunction) {
    this.set('body', sanitizeHtml(this.body));
    this.set('createdAt', new Date());
    this.set('updatedAt', new Date());

    return next();
});
