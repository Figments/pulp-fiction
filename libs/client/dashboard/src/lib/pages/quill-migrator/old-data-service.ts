import { Injectable } from "@angular/core";
import { DragonfishNetworkService } from "@dragonfish/client/services";
import { ContentFilter, ContentKind, ContentModel, ProseContent } from "@dragonfish/shared/models/content";
import { PaginateResult } from "@dragonfish/shared/models/util";
import { flatten } from "lodash";

@Injectable()
export class OldDataService {
    constructor(private readonly networkService: DragonfishNetworkService) { }

    // Get old content
    public async getOldContent(): Promise<ContentModel[]> {
        const firstPage = await this.networkService.fetchAllContent(
            1,
            [ContentKind.ProseContent, ContentKind.PoetryContent],
            ContentFilter.Everything
        ).toPromise();
        console.log(`FirstPage return totalPages: ${firstPage.totalPages}`);

        const totalPages = firstPage.totalPages;
        const pagePromises: Promise<PaginateResult<ContentModel>>[] = [];
        for (let i = 2; i <= totalPages; i++) {
            const promise = this.networkService.fetchAllContent(
                i,
                [ContentKind.ProseContent, ContentKind.PoetryContent],
                ContentFilter.Everything
            ).toPromise();

            pagePromises.push(promise);
        }

        const otherPages = flatten((await Promise.all(pagePromises)).map(x => x.docs));
        const allContent = firstPage.docs.concat(otherPages);
        console.log(`All docs count: ${allContent.length}`);
        // Only return anything with at least one section that hasn't been updated since Sep 18, 2020,
        // as that was when we did the big Quill cahngeover
        // OR content that still has a Quilly long desc
        return allContent.filter(x => {
            const hasOldSections = (x as ProseContent).sections.some(sec => new Date(sec.updatedAt) < new Date(2020, 8, 18));
            const hasQuillLongDesc = x.body.startsWith("{\"ops\":");
            return hasOldSections || hasQuillLongDesc;
        });
    }
}
