import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {FilterQuery, Model} from 'mongoose';
import * as models from './models';
import { UsersService } from '../users/users.service';
import {SearchParameters} from '../../api/search/models/search-parameters';
import {SearchResults} from '../../api/search/models/search-results';

@Injectable()
export class WorksService {
    constructor(
        @InjectModel('Work') private readonly workModel: Model<models.Work>,
        @InjectModel('Section') private readonly sectionModel: Model<models.Section>,
        private readonly usersService: UsersService) {}
    
    /* Work and Section creation*/
    
    /**
     * Creates a new work and saves it to the database, updating a user's work count.
     * Returns the newly created work as a promise.
     * 
     * @param user The user making the work.
     * @param newWorkInfo The new work's information.
     */
    async createNewWork(user: any, newWorkInfo: models.CreateWork): Promise<models.Work> {
        const newWork = new this.workModel({
            author: user.sub,
            title: newWorkInfo.title,
            shortDesc: newWorkInfo.shortDesc,
            longDesc: newWorkInfo.longDesc,
            meta: {
                category: newWorkInfo.category,
                fandoms: newWorkInfo.fandoms,
                genres: newWorkInfo.genres,
                rating: newWorkInfo.rating,
                status: newWorkInfo.status,
            },
            audit: {
                published: newWorkInfo.published,
            }
        });

        return await newWork.save().then(async work => {
            const workCount = await this.workModel.countDocuments({author: user.sub});
            await this.usersService.updateWorkCount(user.sub, workCount);
            return work;
        });
    }

    /**
     * Creates a new section and adds it to the database, updating the associated work's
     * array of sections. Returns the newly created section as a promise.
     * 
     * @param workId The work this section is being added to.
     * @param newSectionInfo The section's information.
     */
    async createNewSection(workId: string, newSectionInfo: models.CreateSection): Promise<models.Section> {
        const newSection = new this.sectionModel({
            title: newSectionInfo.title,
            body: newSectionInfo.body,
            authorsNote: newSectionInfo.authorsNote,
            published: newSectionInfo.published,
        });

        return await newSection.save().then(async section => {
            await this.workModel.findByIdAndUpdate(workId, {$push: {"sections": section._id}});
            return section;
        });
    }

    /* Work and Section retrieval */

    /**
     * Looks up a work by its ID and returns it.
     * 
     * @param workId The work you're trying to find.
     */
    async findOneWorkById(workId: string): Promise<models.Work> {
        return await this.workModel.findById(workId).where('audit.isDeleted', false);
    }

    /**
     * Grabs all a user's works and returns them in an array. Used only
     * for a user's own works list.
     * 
     * @param user The user whose works we're fetching.
     */
    async fetchUserWorks(user: any): Promise<models.Work[]> {
        return await this.workModel.find().where('author', user.sub).where('audit.isDeleted', false);
    }

    async findRelatedWorks(searchParameters: SearchParameters): Promise<SearchResults<models.Work> | null> {
        const p = searchParameters.pagination;
        const filter: FilterQuery<models.Work> = {
            $text: {$search: searchParameters.text},
            'audit.published': true,
        };

        const results = await this.workModel.find(filter,
            {
                searchScore: {$meta: 'textScore'}
            }).sort({score: {$meta: 'textScore'}})
            .sort({'stats.views': -1})
            .skip((p.page - 1) * p.pageSize)
            .limit(p.pageSize);

        if (results.length === 0 && p.page !== 1) {
            return null;
        } else {
            const totalPages = Math.ceil(
                await this.workModel.count(filter) / p.pageSize // God, we should probably cache this stuff.
            );
            return {
                matches: results,
                totalPages: totalPages,
                pagination: searchParameters.pagination
            };
        }
    }
}
