import { Controller, Param, Get } from '@nestjs/common';

import { ContentService } from '../../../db/content/content.service';

@Controller('news')
export class NewsController {
    constructor(private readonly contentService: ContentService) {}

    @Get('news-feed/:pageNum')
    async getNewsFeed(@Param('pageNum') pageNum: number) {
        return await this.contentService.fetchManyByKind('NewsContent', pageNum, true);
    }

    @Get('news-post/:postId')
    async getNewsPost(@Param('postId') postId: string) {
        return await this.contentService.fetchOnePublished(postId, 'NewsContent');
    }
}
