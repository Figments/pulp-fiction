import { Injectable } from '@nestjs/common';
import { PaginateResult } from 'mongoose';

import { Work } from 'shared/models/works';
import { WorksService } from 'src/db/works/works.service';

@Injectable()
export class BrowseService {
    constructor(private readonly worksService: WorksService) {}

    /**
     * Gets all new published works in descending order.
     */
    async getAllNewPublishedWorks(pageNum: number): Promise<PaginateResult<Work>> {
        return await this.worksService.fetchNewPublishedWorks(pageNum);
    }
}
