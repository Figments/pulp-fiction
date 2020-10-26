import { Controller, UseGuards, Request, Query, Get, BadRequestException, Patch } from '@nestjs/common';

import { OptionalAuthGuard, RolesGuard } from '../../guards';
import { ContentService } from '../../db/content';
import { ContentKind } from '@pulp-fiction/models/content';
import { Roles } from '@pulp-fiction/models/users';
import { isNullOrUndefined } from '../../util';
import { ContentFoldersService } from '../../db/content-folders/content-folders.service';

@Controller()
export class ContentController {
    constructor (private readonly contentService: ContentService, private readonly folderService: ContentFoldersService) {}

    @UseGuards(OptionalAuthGuard)
    @Get('fetch-one')
    async fetchOne(@Request() req: any, @Query('contentId') contentId: string, @Query('kind') kind: ContentKind, @Query('isPublished') isPublished: boolean) {
        if (isNullOrUndefined(contentId) && isNullOrUndefined(kind)) {
            throw new BadRequestException(`You must include the content ID and the content kind in your request.`);
        }

        return await this.contentService.fetchOne(contentId, kind, req.user, isPublished);
    }

    @UseGuards(RolesGuard([Roles.User]))
    @Get('fetch-all')
    async fetchAll(@Request() req: any) {
        return await this.contentService.fetchAll(req.user);
    }

    @UseGuards(RolesGuard([Roles.User]))
    @Patch('delete-one')
    async deleteOne(@Request() req: any, @Query('contentId') contentId: string) {
        if (isNullOrUndefined(contentId)) {
            throw new BadRequestException(`You must include the content ID.`);
        }

        return await this.contentService.deleteOne(req.user, contentId);
    }

    @UseGuards(RolesGuard([Roles.User]))
    @Get('fetch-top-folders')
    async fetchTopFolders(@Request() req: any) {
        return await this.folderService.fetchTopFolders(req.user);
    }
}
