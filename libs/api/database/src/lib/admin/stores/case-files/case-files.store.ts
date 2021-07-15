import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    CaseFileDocument,
    CommentCaseFileDocument,
    ContentCaseFileDocument,
    UserCaseFileDocument,
} from '../../schemas';
import { CaseKind, NoteForm, ReportForm } from '@dragonfish/shared/models/case-files';
import { isNullOrUndefined } from '@dragonfish/shared/functions';
import { JwtPayload } from '@dragonfish/shared/models/auth';
import * as sanitize from 'sanitize-html';

@Injectable()
export class CaseFilesStore {
    constructor(
        @InjectModel('CaseFiles') private readonly caseFiles: Model<CaseFileDocument>,
        @InjectModel('ContentCaseFiles') private readonly contentFiles: Model<ContentCaseFileDocument>,
        @InjectModel('CommentCaseFiles') private readonly commentFiles: Model<CommentCaseFileDocument>,
        @InjectModel('UserCaseFiles') private readonly userFiles: Model<UserCaseFileDocument>,
    ) {}

    /**
     * Fetches all active case files.
     */
    public async fetchAllActive(): Promise<CaseFileDocument[]> {
        return this.caseFiles.find({ isClosed: false });
    }

    /**
     * Fetches all closed case files.
     */
    public async fetchAllClosed(): Promise<CaseFileDocument[]> {
        return this.caseFiles.find({ isClosed: true });
    }

    /**
     * Gets the current count of active case files.
     */
    public async getActiveCount(): Promise<number> {
        return this.caseFiles.countDocuments({ isClosed: false });
    }

    /**
     * Submits a report to an existing document. If no active case file exists, creates a new one.
     * @param user
     * @param itemId
     * @param caseKind
     * @param form
     */
    public async submitReport(user: JwtPayload, itemId: string, caseKind: CaseKind, form: ReportForm) {
        console.log(`Submitting report for ${caseKind}...`);
        const document = await this.findDocumentByItemId(itemId, caseKind);

        if (isNullOrUndefined(document)) {
            console.log(`Creating document...`);
            await this.createDocument(user, itemId, caseKind, form);
        } else {
            console.log(`Adding report to document...`);
            await this.addReport(user, document, form);
        }
    }

    /**
     * Claims a case file.
     * @param user
     * @param fileId
     */
    public async claimFile(user: JwtPayload, fileId: number) {
        const document = await this.caseFiles.findById(fileId);

        if (isNullOrUndefined(document)) {
            throw new NotFoundException(`The file you're trying to claim doesn't seem to exist.`);
        } else {
            if (isNullOrUndefined(document.claimedBy)) {
                document.claimedBy = user.sub;
                return await document.save();
            } else {
                throw new ConflictException(`Someone else has already claimed this file!`);
            }
        }
    }

    /**
     * Revokes a claim on a file.
     * @param user
     * @param fileId
     */
    public async revokeClaim(user: JwtPayload, fileId: number) {
        const document = await this.caseFiles.findOne({ _id: fileId, claimedBy: user.sub });

        if (isNullOrUndefined(document)) {
            throw new UnauthorizedException(`You don't have permission to do that.`);
        } else {
            document.claimedBy = null;
            return await document.save();
        }
    }

    /**
     * Adds a note to an existing case file. If the requested file doesn't exist, throws an error.
     * @param user
     * @param caseId
     * @param form
     */
    public async addNote(user: JwtPayload, caseId: number, form: NoteForm) {
        const document = await this.caseFiles.findById(caseId).where({ isClosed: false });

        if (isNullOrUndefined(document)) {
            throw new NotFoundException(`The case file you're looking for cannot be found.`);
        }

        // has to be cast as `any` to avoid type errors, despite this being legitimate mongoose syntax.
        document.notes.push(<any>{ user: user.sub, body: sanitize(form.body) });
        return await document.save().then((doc) => {
            return doc.notes[length - 1];
        });
    }

    //#region ---PRIVATE---

    /**
     * Finds and returns a document with the specified attached `itemId`. Filters based on
     * `caseKind`.
     * @param itemId
     * @param caseKind
     * @private
     */
    private async findDocumentByItemId(
        itemId: string,
        caseKind: CaseKind,
    ): Promise<CommentCaseFileDocument | ContentCaseFileDocument | UserCaseFileDocument> {
        switch (caseKind) {
            case CaseKind.Comments:
                return this.commentFiles.findOne({ comment: itemId, isClosed: false });
            case CaseKind.Content:
                return this.contentFiles.findOne({ content: itemId, isClosed: false });
            case CaseKind.Users:
                return this.userFiles.findOne({ user: itemId, isClosed: false });
        }
    }

    /**
     * Creates a new case file and adds the latest report to its reports array.
     * @param user
     * @param itemId
     * @param caseKind
     * @param form
     * @private
     */
    private async createDocument(
        user: JwtPayload,
        itemId: string,
        caseKind: CaseKind,
        form: ReportForm,
    ): Promise<void> {
        if (caseKind === CaseKind.Content) {
            const newDoc = new this.contentFiles({ content: itemId });
            console.log(newDoc);
            await this.addReport(user, newDoc, form);
        } else if (caseKind === CaseKind.Users) {
            const newDoc = new this.userFiles({ user: itemId });
            console.log(newDoc);
            await this.addReport(user, newDoc, form);
        } else if (caseKind === CaseKind.Comments) {
            throw new InternalServerErrorException(`This feature is not yet supported.`);
        }
    }

    /**
     * Adds a report to an existing document.
     * @param user
     * @param document
     * @param form
     * @private
     */
    private async addReport(user: JwtPayload, document: CaseFileDocument, form: ReportForm): Promise<void> {
        // has to be cast as `any` to avoid type errors, despite this being legitimate mongoose syntax.
        document.reports.push(<any>{ user: user.sub, reasons: form.reasons, body: sanitize(form.body) });
        await document.save().then(() => {
            console.log(`Saved!`);
        });
    }

    //#endregion
}
