import { Controller, UseGuards, Request, Get, Put, Body, Patch } from '@nestjs/common';

import * as models from 'src/db/blogs/models';
import { BlogsService } from 'src/db/blogs/blogs.service';
import { AuthGuard } from 'src/guards';

@Controller('blogs')
export class BlogsController {
    constructor(private readonly blogsService: BlogsService) {}

    @UseGuards(AuthGuard)
    @Get('fetch-user-blogs')
    async fetchUserBlogs(@Request() req: any) {
        return await this.blogsService.fetchUserBlogs(req.user);
    }

    @UseGuards(AuthGuard)
    @Put('create-blog')
    async createBlog(@Request() req: any, @Body() newBlog: models.CreateBlog) {
        return await this.blogsService.createNewBlog(req.user, newBlog);
    }

    @UseGuards(AuthGuard)
    @Patch('delete-blog')
    async deleteBlog(@Request() req: any, @Body() blogId: string) {
        return await this.blogsService.deleteBlog(req.user, blogId);
    }

    @UseGuards(AuthGuard)
    @Patch('set-publish-status')
    async setPublishStatus(@Request() req: any, @Body() pubStatus: models.SetPublishStatus) {
        
    }
}