import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtPayload } from '@pulp-fiction/models/auth';
import { ContentKind } from '@pulp-fiction/models/content';
import { MigrationForm } from '@pulp-fiction/models/migration';

import { OldBlogsService } from '../../db/blogs/blogs.service';
import { ContentService } from '../../db/content';
import { WorksService } from '../../db/works/works.service';

@Injectable()
export class MigrationService {
    constructor (private readonly contentService: ContentService, 
        private readonly worksService: WorksService, 
        private readonly blogsService: OldBlogsService) {}

    async fetchWorks(user: JwtPayload) {
        return await this.worksService.fetchUserWorks(user);
    }

    async fetchBlogs(user: JwtPayload) {
        return await this.blogsService.fetchUserBlogs(user);
    }

    async fetchOneBlog(user: JwtPayload, blogId: string) {
        return await this.blogsService.findOneById(user, blogId);
    }

    async fetchOneWork(user: JwtPayload, workId: string) {
        return await this.worksService.findOneById(user, workId);
    }

    async saveMigration(user: JwtPayload, formData: MigrationForm) {
        switch (formData.kind) {
            case ContentKind.BlogContent:
                await this.contentService.migrateBlog(user, formData);
                return;
            case ContentKind.ProseContent:
                await this.contentService.migrateWork(user, formData);
                return;
            default:
                throw new BadRequestException(`Migration can only apply to prose and blogs.`);
        }
    }
}