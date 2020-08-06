import { Controller, UseGuards, Request, Body, Get, Post, Param, Patch } from '@nestjs/common';

import { ContribService } from './contrib.service';
import { Decision } from './models';
import { Roles } from 'src/db/users/models';
import { RolesGuard } from 'src/guards';

@Controller()
export class ContribController {
    constructor(private readonly contribService: ContribService) {}

    @UseGuards(RolesGuard[Roles.User])
    @Post('submit-work/:workId')
    async submitWork(@Request() req: any, @Param('workId') workId: string) {
        return await this.contribService.submitWork(req.user, workId);
    }

    @UseGuards(RolesGuard([Roles.WorkApprover, Roles.Moderator, Roles.Admin]))
    @Get('queue')
    async getQueue() {
        return await this.contribService.getQueue();
    }

    @UseGuards(RolesGuard([Roles.WorkApprover, Roles.Moderator, Roles.Admin]))
    @Get('queue-for-mod')
    async getQueueForMod(@Request() req: any) {
        return await this.contribService.getQueueForMod(req.user);
    }

    @UseGuards(RolesGuard([Roles.WorkApprover, Roles.Moderator, Roles.Admin]))
    @Patch('claim-work/:docId')
    async claimWork(@Request() req: any, @Param('docId') docId: string) {
        return await this.contribService.claimWork(req.user, docId);
    }

    @UseGuards(RolesGuard([Roles.WorkApprover, Roles.Moderator, Roles.Admin]))
    @Patch('approve-work')
    async approveWork(@Request() req: any, @Body() decision: Decision) {
        return await this.contribService.approveWork(
            req.user,
            decision.docId,
            decision.workId,
            decision.authorId,
        );
    }

    @UseGuards(RolesGuard([Roles.WorkApprover, Roles.Moderator, Roles.Admin]))
    @Patch('reject-work')
    async rejectWork(@Request() req: any, @Body() decision: Decision) {
        return await this.contribService.rejectWork(
            req.user,
            decision.docId,
            decision.workId,
            decision.authorId,
        );
    }
}
