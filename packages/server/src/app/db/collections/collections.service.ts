import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, PaginateResult } from 'mongoose';
import { sanitizeHtml } from '@pulp-fiction/html_sanitizer';

import { JwtPayload } from '@pulp-fiction/models/auth';
import { CollectionForm } from '@pulp-fiction/models/collections';
import { CollectionDocument } from './collection.schema';
import { isNullOrUndefined } from '../../util';
import { ContentModel } from '@pulp-fiction/models/content';

@Injectable()
export class CollectionsService {
    constructor(@InjectModel('Collection') private readonly collModel: PaginateModel<CollectionDocument>) {}

    /**
     * Creates a collection and saves it to the database.
     * 
     * @param userId The owner of the collection
     * @param collForm The collection's information
     */
    async createCollection(userId: string, collForm: CollectionForm): Promise<CollectionDocument> {
        const newCollection = new this.collModel({
            'owner': userId,
            'name': collForm.name,
            'desc': await sanitizeHtml(collForm.desc),
        });

        return await newCollection.save();
    }

    /**
     * Adds a piece of content to a collection.
     * 
     * @param user The owner of the collection
     * @param collId The collection's ID
     * @param contentId The content being added to it
     */
    async addToCollection(user: JwtPayload, collId: string, contentId: string): Promise<CollectionDocument> {
        const thisCollection = await this.collModel.findOne({'_id': collId, 'owner': user.sub, 'audit.isDeleted': false}, {autopopulate: false});

        if (isNullOrUndefined(thisCollection)) {
            throw new NotFoundException(`The collection you're trying to add to doesn't exist.`);
        }
        const currArray = thisCollection.contains as string[];
        currArray.push(contentId);
        thisCollection.contains = currArray;
        return await thisCollection.save();
    }

    /**
     * Removes a piece of content from a collection. Also deletes the `collItem` document associated with it.
     * 
     * @param user The owner of the collection
     * @param collId The collection ID
     * @param collItemId The item ID to delete
     * @param contentId The content being removed
     */
    async removeFromCollection(user: JwtPayload, collId: string, contentId: string): Promise<CollectionDocument> {
        const thisCollection = await this.collModel.findOne({'_id': collId, 'owner': user.sub, 'audit.isDeleted': false}, {autopopulate: false});

        if (isNullOrUndefined(thisCollection)) {
            throw new NotFoundException(`The collection you're trying to add to doesn't exist.`);
        }
        const currArray = thisCollection.contains as ContentModel[];
        const newCollContainsArray = currArray.filter(val => { return val._id !== contentId});
        thisCollection.contains = newCollContainsArray;
        return await thisCollection.save();
    }

    /**
     * Gets all undeleted collections belonging to a single user.
     * 
     * @param user The owner of these collections
     * @param pageNum The page of results to fetch
     */
    async getAllCollections(user: JwtPayload, pageNum: number): Promise<PaginateResult<CollectionDocument>> {
        return await this.collModel.paginate({'owner': user.sub, 'audit.isDeleted': false}, {
            sort: {'createdAt': -1},
            page: pageNum,
            limit: 15
        });
    }

    /**
     * Gets all undeleted collections belonging to a single user.
     * 
     * @param user The owner of these collections
     */
    async getUserCollectionsNoPaginate(user: JwtPayload): Promise<CollectionDocument[]>{
        return await this.collModel.find({'owner': user.sub, 'audit.isDeleted': false});
    }

    /**
     * Fetches all public collections that a user has.
     * 
     * @param user The owner of the portfolio
     */
    async getPublicCollections(user: JwtPayload, pageNum: number): Promise<PaginateResult<CollectionDocument>> {
        return await this.collModel.paginate({'owner': user.sub, 'audit.isPublic': true, 'audit.isDeleted': false}, {
            sort: {'createdAt': -1},
            page: pageNum,
            limit: 15
        });
    }

    /**
     * Grabs a single collection from the database belonging to the specified user.
     * 
     * @param userId The owner of the portfolio
     * @param collId The collection to fetch
     * @param getPublic Determines whether to get public or private collections
     */
    async getOneCollection(user: JwtPayload, collId: string, getPublic: boolean): Promise<CollectionDocument> {
        if (getPublic === true) {
            return await this.collModel.findOne({'_id': collId, 'audit.isPublic': true, 'audit.isDeleted': false});
        } else {
            return await this.collModel.findOne({'_id': collId, 'owner': user.sub, 'audit.isDeleted': false});
        }
    }

    /**
     * Edits a collection given the newest collection info.
     * 
     * @param user The owner of the collection
     * @param collId The collection ID
     * @param collInfo The new collection info
     */
    async editCollection(user: JwtPayload, collId: string, collInfo: CollectionForm): Promise<CollectionDocument> {
        const thisCollection = await this.collModel.findOne({'_id': collId, 'owner': user.sub, 'audit.isDeleted': false});

        if (isNullOrUndefined(thisCollection)) {
            throw new NotFoundException(`The collection you wanted to edit cannot be found.`);
        }

        thisCollection.name = collInfo.name;
        thisCollection.desc = collInfo.desc;

        return await thisCollection.save();
    }

    /**
     * Soft deletes a collection associated with the provided user.
     * 
     * @param user The owner of the collection
     * @param collId The collection to delete
     */
    async deleteCollection(user: JwtPayload, collId: string): Promise<void> {
        return await this.collModel.updateOne({'_id': collId, 'owner': user.sub}, {'audit.isDeleted': true});
    }

    /**
     * Sets a collection's isPublic flag to true.
     * 
     * @param user The owner of the collection
     * @param collId The collection to make public
     */
    async setPublic(user: JwtPayload, collId: string): Promise<void> {
        return await this.collModel.updateOne({'_id': collId, 'owner': user.sub, 'audit.isDeleted': false}, {'audit.isPublic': true});
    }

    /**
     * Sets a collection's isPublic flag to false.
     * 
     * @param user The owner of the collection
     * @param collId The collection to make private
     */
    async setPrivate(user: JwtPayload, collId: string): Promise<void> {
        return await this.collModel.updateOne({'_id': collId, 'owner': user.sub, 'audit.isDeleted': false}, {'audit.isPublic': false});
    }
}
