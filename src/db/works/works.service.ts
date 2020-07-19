import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Library, types } from 'ffi-napi';

import * as models from './models';
import { UsersService } from '../users/users.service';

@Injectable()
export class WorksService {
    
    private wordCounterLib: any;

    constructor(
        @InjectModel('Work') private readonly workModel: Model<models.Work>,
        @InjectModel('Section') private readonly sectionModel: Model<models.Section>,
        private readonly usersService: UsersService) {
            this.wordCounterLib = new Library("../../native/compiled/word_counter", {
                'count_words': ['uint32', ['string']]
            })
        }
    
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
        
        // TODO: Something like this for word count
        //const wordCount = this.wordCounterLib.count_words(newWorkInfo.body);
        //newWork.stats.totWords = wordCount;

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
            await this.workModel.updateOne({"_id": workId}, {$push: {"sections": section._id}});
            return section;
        })
    }

    /* Work and Section retrieval */

    /**
     * Looks up a work by its ID and returns it.
     * 
     * @param workId The work you're trying to find.
     */
    async findOneWorkById(workId: string): Promise<models.Work> {
        return await this.workModel.findById(workId);
    }

    /**
     * Grabs all a user's works and returns them in an array. Used only
     * for a user's own works list.
     * 
     * @param user The user whose works we're fetching.
     */
    async fetchUserWorks(user: any): Promise<models.Work[]> {
        return await this.workModel.find().where('author', user.sub);
    }
}
