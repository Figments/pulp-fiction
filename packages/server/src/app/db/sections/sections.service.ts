import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { sanitizeHtml, stripAllHtml } from '@pulp-fiction/html_sanitizer'
import { SectionForm } from '@pulp-fiction/models/sections';
import { SectionsDocument } from './sections.schema';
import { countPlaintextWords, countQuillWords } from '@pulp-fiction/word_counter';

@Injectable()
export class SectionsService {
    constructor(@InjectModel('Section') private readonly sectionModel: Model<SectionsDocument>) {}

    /**
     * Creates a new section and adds it to the database, updating the associated work's
     * array of sections. Returns the newly created section as a promise.
     * 
     * @param sectionInfo The new section's info
     */
    async createNewSection(sectionInfo: SectionForm): Promise<SectionsDocument> {
        const newSection = new this.sectionModel({
            title: sectionInfo.title,
            body: sectionInfo.body,
            authorsNote: sectionInfo.authorsNote,
            authorsNotePos: sectionInfo.authorsNotePos,

            // Delete this when we're all migrated
            usesNewEditor: sectionInfo.usesNewEditor
        });

        return await newSection.save();
    }

    /**
     * Updates a section with the provided edits. Returns the updated document.
     * 
     * @param sectionId The section ID
     * @param sectionInfo The new section information
     */
    async editSection(sectionId: string, sectionInfo: SectionForm): Promise<SectionsDocument> {
        return await this.sectionModel.findOneAndUpdate({'_id': sectionId}, {
            'title': await sanitizeHtml(sectionInfo.title),
            'body': await sanitizeHtml(sectionInfo.body),
            'authorsNote': await sanitizeHtml(sectionInfo.authorsNote),
            'authorsNotePos': sectionInfo.authorsNotePos,
            'stats.words': sectionInfo.usesNewEditor
                ? await countPlaintextWords(await stripAllHtml(sectionInfo.body))
                : await countQuillWords(await sanitizeHtml(sectionInfo.body)),
            'usesNewEditor': sectionInfo.usesNewEditor
        }, {new: true});
    }

    /**
     * Sets a section's publishing status based on `pubStatus`. If true, also sets the publishing date.
     * 
     * @param sectionId The section ID
     * @param pubStatus The new pub status
     */
    async publishSection(sectionId: string, pubStatus: boolean): Promise<SectionsDocument> {
        if (pubStatus === true) {
            return await this.sectionModel.findOneAndUpdate({'_id': sectionId}, {'published': pubStatus, 'audit.publishedOn': new Date()}, {new: true});
        } else {
            return await this.sectionModel.findByIdAndUpdate({'_id': sectionId}, {'published': pubStatus}, {new: true});
        }
    }

    /**
     * Deletes a given section based on its ID by setting its `isDeleted` field to true.
     * 
     * @param sectionId The section ID
     */
    async deleteSection(sectionId: string): Promise<void> {
        return await this.sectionModel.updateOne({'_id': sectionId}, {'audit.isDeleted': true});
    }
}
