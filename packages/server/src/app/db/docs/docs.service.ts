import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as lodash from 'lodash';
import * as sanitize from 'sanitize-html';
import { countWords } from '@pulp-fiction/word_counter';

import * as documents from './models';
import * as models from '@pulp-fiction/models/docs';
import { JwtPayload } from '@pulp-fiction/models/auth';
import { Roles } from '@pulp-fiction/models/users';

@Injectable()
export class DocsService {
    constructor(@InjectModel('Doc') private readonly docModel: Model<documents.DocDocument>) {}

    /**
     * Creates a new site document and adds it to the Docs collection.
     * 
     * @param user The admin creating the doc
     * @param docInfo The doc's info
     */
    async createDoc(user: JwtPayload, docInfo: models.CreateDoc): Promise<models.Doc> {
        const requiredRole: Roles[] = [Roles.Admin];
        const hasRoles = lodash.intersection(user.roles, requiredRole);
        if (hasRoles.length > 0) {
            const newDoc = new this.docModel({
                "_id": docInfo._id,
                "contributors": [user.sub],
                "docName": docInfo.docName,
                "docDescription": docInfo.docDescription,
                "docBody": docInfo.docBody,
                "audit.approvedRoles": docInfo.approvedRoles,
                "audit.lastUpdatedBy": user.sub,
            });
    
            return await newDoc.save();
        } else {
            throw new UnauthorizedException(`You don't have permission to create a new document.`);
        }
    }

    /**
     * Fetches a site document from the database.
     * 
     * @param docId The doc to fetch
     */
    async fetchDoc(docId: string): Promise<models.Doc> {
        return await this.docModel.findById(docId).where("audit.isDeleted", false);
    }

    /**
     * Fetches a doc for editing. Only to be used from the dashboard service.
     * 
     * @param docId The doc to fetch for edits
     */
    async fetchDocForEdit(user: JwtPayload, docId: string): Promise<models.Doc> {
        const thisDoc = await this.docModel.findById(docId).where("audit.isDeleted", false);
        const rolesIntersection = lodash.intersection(user.roles, thisDoc.audit.approvedRoles);
        if (rolesIntersection.length === 0) {
            throw new UnauthorizedException(`You don't have permission to edit this document.`);
        } else {
            return thisDoc;
        }
    }

    /**
     * Fetches all site documents for display in the dashboard
     */
    async fetchAllDocsForDashboard(): Promise<models.Doc[]> {
        return await this.docModel.find();
    }

    /**
     * Edits a site document and updates who last edited it.
     * 
     * @param user The user making the edits
     * @param docInfo The new doc info
     */
    async editDoc(user: JwtPayload, docInfo: models.EditDoc): Promise<void> {
        const thisDoc = await this.docModel.findById(docInfo._id).where("audit.isDeleted", false);
        const rolesIntersection = lodash.intersection(user.roles, thisDoc.audit.approvedRoles);
        if (rolesIntersection.length === 0) {
            throw new UnauthorizedException(`You don't have permission to edit this document.`);
        } else {
            const wordCount = docInfo.usesFroala
                ? 3 // TODO: Replace this with a real word count 
                : await countWords(sanitize(docInfo.docBody));
            return await this.docModel.updateOne({"_id": docInfo._id}, {
                "docTitle": sanitize(docInfo.docTitle),
                "docBody": sanitize(docInfo.docBody),
                "words": wordCount,
                "lastUpdatedBy": user.sub,

                "usesFroala": docInfo.usesFroala
            });
        } 
    }

    /**
     * Soft deletes a site document, removing it from view on the main site.
     * 
     * @param user The admin making this change
     * @param docId The document to delete
     */
    async deleteDoc(user: JwtPayload, docId: string): Promise<void> {
        const requiredRole: Roles[] = [Roles.Admin];
        const hasRoles = lodash.intersection(user.roles, requiredRole);
        if (hasRoles.length > 0) {
            return await this.docModel.updateOne({"_id": docId}, {
                "audit.lastUpdatedBy": user.sub,
                "audit.isDeleted": true
            });
        } else {
            throw new UnauthorizedException(`You don't have permission to delete this document.`);
        }
    }
}
