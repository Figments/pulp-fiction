import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as models from './models';
import { UsersService } from '../users/users.service';

@Injectable()
export class BlogsService {
    constructor(@InjectModel('Blog') private readonly blogModel: Model<models.Blog>, private readonly usersService: UsersService) {}

    /**
     * Creates a new blogpost and saves it to the database. Returns the newly
     * created blog as a promise.
     *
     * @param user The user making the blog.
     * @param newBlogInfo The blog's information.
     */
    async createNewBlog(user: any, newBlogInfo: models.CreateBlog): Promise<models.Blog> {
        const newBlog = new this.blogModel({
            author: user.sub,
            title: newBlogInfo.title,
            body: newBlogInfo.body,
            published: newBlogInfo.published});
        return await newBlog.save().then(async blog => {
            const blogCount = await this.blogModel.countDocuments({author: user.sub});
            await this.usersService.updateBlogCount(user.sub, blogCount);
            return blog;
        });
    }

    /**
     * Finds a blog by a given ID and returns it in a promise.
     *
     * @param blogId The incoming blog ID.
     */
    async findOneById(blogId: string): Promise<models.Blog> {
        return await this.blogModel.findById(blogId);
    }

    /**
     * Fetches a user's blogs based on their user ID. Returns the array
     * as a promise.
     *
     * @param user The user whose blogs are being requested.
     */
    async fetchUserBlogs(user: any): Promise<models.Blog[]> {
        return await this.blogModel.find().where('author', user.sub);
    }
}
