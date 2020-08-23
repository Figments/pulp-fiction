import { Controller, Get } from '@nestjs/common';

import { UsersService } from '../../../db/users/users.service';
import { WorksService } from '../../../db/works/works.service';
import { FrontPageStats } from '@pulp-fiction/models/stats';

@Controller('stats')
export class StatsController {
    constructor(private readonly usersService: UsersService, private readonly worksService: WorksService) {}

    @Get('front-page-stats')
    async getFooterStats() {
        const userCount = await this.usersService.getUserCount();
        const workCount = await this.worksService.getTotalWorkCount();
        const frontPageStats: FrontPageStats = {
            numUsers: userCount,
            numWorks: workCount
        }

        return frontPageStats;
    }
}
