import { Injectable, Logger } from '@nestjs/common';

import { ContentStore } from '../../db/content';

@Injectable()
export class ContentService {
    private readonly logger: Logger = new Logger(ContentService.name);

    constructor (private readonly content: ContentStore) {}
}