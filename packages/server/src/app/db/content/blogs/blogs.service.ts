import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtPayload } from '@pulp-fiction/models/auth';
import { PaginateModel } from 'mongoose';
import { UsersService } from '../../users/users.service';

import { BlogsContentDocument } from './blogs-content.document';
import { BlogForm, PubStatus } from '@pulp-fiction/models/content';
import { sanitizeHtml, stripAllHtml } from '@pulp-fiction/html_sanitizer';
import { countPlaintextWords } from '@pulp-fiction/word_counter';


@Injectable()
export class BlogsService {
    constructor(@InjectModel('BlogContent') private readonly blogsModel: PaginateModel<BlogsContentDocument>,
        private readonly usersService: UsersService) {}

    /**
     * Creates a new blogpost and saves it to the database. Returns the newly
     * created blog as a promise.
     *
     * @param user The user making the blog.
     * @param blogInfo The blog's information.
     */  
    async createNewBlog(user: JwtPayload, blogInfo: BlogForm): Promise<BlogsContentDocument> {
        const newBlog = new this.blogsModel({
            'author': user.sub,
            'title': await sanitizeHtml(blogInfo.title),
            'body': await sanitizeHtml(blogInfo.body),
            'stats.words': await countPlaintextWords(await stripAllHtml(blogInfo.body))
        });

        return await newBlog.save();
    }

    /**
     * Edits a given user's blog using the provided information in the EditBlog
     * model.
     *
     * @param user The author of the blog
     * @param blogId The blog's ID
     * @param blogInfo The blog info for the update
     */
    async editBlog(user: JwtPayload, blogId: string, blogInfo: BlogForm): Promise<void> {
        const wordcount = await countPlaintextWords(await stripAllHtml(blogInfo.body));

        return await this.blogsModel.updateOne({'_id': blogId, 'author': user.sub}, {
            'title': await sanitizeHtml(blogInfo.title),
            'body': await sanitizeHtml(blogInfo.body),
            'stats.words': wordcount
        });
    }

    /**
     * Changes the publishing status of the specified blog. If there was a change in the publishing status,
     * like from true to false, then change the blog count on the specified user accordingly. Otherwise, do
     * nothing.
     * 
     * @param user The author of the blog
     * @param blogId The blog's ID
     * @param pubStatus Object for change in publishing status
     */
    async changePublishStatus(user: JwtPayload, blogId: string, pubStatus: PubStatus): Promise<void> {
        await this.blogsModel.updateOne({'_id': blogId, 'author': user.sub}, {
            'audit.published': pubStatus.newStatus,
            'audit.publishedOn': new Date()
        });

        if (pubStatus.oldStatus === false && pubStatus.newStatus === true) {
            await this.usersService.changeBlogCount(user, true);
        } else if (pubStatus.oldStatus === true && pubStatus.newStatus === false) {
            await this.usersService.changeBlogCount(user, false);
        }
    }
}
