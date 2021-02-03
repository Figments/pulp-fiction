import { Controller, Request, Param, Get, UseGuards } from '@nestjs/common';
import { Cookies } from '@nestjsplus/cookies';

import { ContentService } from '../../../db/content/content.service';
import { OptionalAuthGuard } from '../../../guards';
import { ContentFilter, ContentKind } from '@dragonfish/models/content';
import { NewsService } from '../../../db/content';

@Controller('news')
export class NewsController {
    constructor(private readonly contentService: ContentService, private readonly newsService: NewsService) {}

    @Get('initial-posts')
    async getInitialPosts(@Cookies('contentFilter') filter: ContentFilter) {
        return await this.newsService.fetchForHome(filter);
    }

    @Get('news-feed/:pageNum')
    async getNewsFeed(@Param('pageNum') pageNum: number, @Cookies('contentFilter') filter: ContentFilter) {
        return await this.contentService.fetchAllPublished(pageNum, [ContentKind.NewsContent], filter);
    }

    @UseGuards(OptionalAuthGuard)
    @Get('news-post/:postId')
    async getNewsPost(@Request() req: any, @Param('postId') postId: string) {
        return await this.contentService.fetchOnePublished(
            postId, // the contentId of the post
            ContentKind.NewsContent, // fetch only a news post
            req.user, // add a view if there's a user
        );
    }
}
