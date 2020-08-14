import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { BlogsService } from 'src/db/blogs/blogs.service';
import { WorksService } from 'src/db/works/works.service';

import { UsersService } from 'src/db/users/users.service';
import { OptionalAuthGuard } from 'src/guards';
import { CollectionsService } from 'src/db/collections/collections.service';

@Controller('portfolio')
export class PortfolioController {
    constructor(private readonly usersService: UsersService, 
        private readonly blogsService: BlogsService, 
        private readonly worksService: WorksService,
        private readonly collsService: CollectionsService) {}

    @Get('get-user-info/:userId')
    async getUserInfo(@Param('userId') userId: string) {
        return await this.usersService.getOneUser(userId);
    }

    @Get('get-blogs-list/:userId')
    async getBlogsList(@Param('userId') userId: string) {
        return await this.blogsService.getPubBlogList(userId);
    }

    @UseGuards(OptionalAuthGuard)
    @Get('get-blog/:blogId')
    async getBlog(@Request() req: any, @Param('blogId') blogId: string) {
        return await this.blogsService.getOneBlog(blogId, req.user);
    }

    @Get('get-works-list/:userId')
    async getWorksList(@Param('userId') userId: string) {
        return await this.worksService.getWorksList(userId);
    }

    @Get('get-collections/:userId')
    async getCollections(@Param('userId') userId: string) {
        return await this.collsService.getPortfolioCollections(userId);
    }
}
