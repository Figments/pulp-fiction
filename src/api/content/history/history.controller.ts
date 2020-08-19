import { Controller, UseGuards, Request, Param, Get, Post, Patch } from '@nestjs/common';

import { RolesGuard } from 'src/guards';
import { Roles } from 'shared/models/users';
import { HistoryService } from 'src/db/history/history.service';

@Controller('history')
export class HistoryController {
    constructor(private readonly histService: HistoryService) {}

    @UseGuards(RolesGuard([Roles.User]))
    @Get('fetch-user-history/:pageNum')
    async fetchUserHistory(@Request() req: any, @Param('pageNum') pageNum: number) {
        return await this.histService.fetchUserHistory(req.user.sub, pageNum);
    }

    @UseGuards(RolesGuard([Roles.User]))
    @Get('fetch-one-hist-doc/:workId')
    async fetchOneHistDoc(@Request() req: any, @Param('workId') workId: string) {
        return await this.histService.fetchOneHistoryDoc(req.user.sub, workId);
    }

    @UseGuards(RolesGuard([Roles.User]))
    @Post('add-or-update-history/:workId')
    async addOrUpdateHistory(@Request() req: any, @Param('workId') workId: string) {
        return await this.histService.addOrUpdateHistory(req.user.sub, workId);
    }

    @UseGuards(RolesGuard([Roles.User]))
    @Patch('change-item-visibility/:histId')
    async changeItemVisibility(@Request() req: any, @Param('histId') histId: string) {
        return await this.histService.changeVisibility(req.user.sub, histId);
    }
}
