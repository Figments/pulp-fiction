import { Injectable } from '@angular/core';
import { ContentViewStore } from './content-view.store';
import { DragonfishNetworkService } from '@dragonfish/client/services';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { UserState } from '@dragonfish/client/repository/user';
import { FrontendUser } from '@dragonfish/shared/models/users';
import { ContentKind, SectionInfo } from '@dragonfish/shared/models/content';
import { tap } from 'rxjs/operators';
import { RatingOption } from '@dragonfish/shared/models/reading-history';
import { ContentViewQuery } from './content-view.query';
import { AlertsService } from '@dragonfish/client/alerts';

@Injectable({ providedIn: 'root' })
export class ContentViewService {
    @SelectSnapshot(UserState.currUser) private currUser: FrontendUser;

    constructor(
        private contentView: ContentViewStore,
        private viewQuery: ContentViewQuery,
        private network: DragonfishNetworkService,
        private alerts: AlertsService,
    ) {}

    public fetchContent(contentId: string, kind: ContentKind) {
        return this.network.fetchContent(contentId, kind).pipe(tap(value => {
            const contentAny = value.content as any;
            let sections = null;
            if (value.content.kind === ContentKind.ProseContent || value.content.kind === ContentKind.PoetryContent) {
                sections = contentAny.sections.filter((x) => {
                    return x.published === true;
                }) as SectionInfo[];
            }
            this.contentView.update({
                currContent: value.content,
                allSections: sections,
                ratingsDoc: value.ratings,
                currRating: value.ratings.rating ? value.ratings.rating : RatingOption.NoVote,
                likes: value.content.stats.likes,
                dislikes: value.content.stats.dislikes,
            });
        }));
    }

    public fetchSection(sectionId: string) {
        return this.network.fetchSection(sectionId).pipe(tap(val => {
            this.contentView.update({
                currSection: val
            });
        }));
    }

    public addLike(contentId: string) {
        switch (this.viewQuery.currRating) {
            case RatingOption.Liked:
                this.alerts.error(`You've already upvoted this content!`);
                return;
            case RatingOption.Disliked:
                this.contentView.update({
                    currRating: RatingOption.Liked,
                    likes: this.viewQuery.likes + 1,
                    dislikes: this.viewQuery.dislikes - 1,
                });
                break;
            case RatingOption.NoVote:
                this.contentView.update({
                    currRating: RatingOption.Liked,
                    likes: this.viewQuery.likes + 1,
                });
                break;
        }

        this.network.addLike(contentId).subscribe(val => {
            this.contentView.update({
                ratingsDoc: val,
                currRating: val.rating,
            });
        });
    }

    public addDislike(contentId: string) {
        switch (this.viewQuery.currRating) {
            case RatingOption.Disliked:
                this.alerts.error(`You've already downvoted this content!`);
                return;
            case RatingOption.Liked:
                this.contentView.update({
                    currRating: RatingOption.Disliked,
                    likes: this.viewQuery.likes - 1,
                    dislikes: this.viewQuery.dislikes + 1,
                });
                break;
            case RatingOption.NoVote:
                this.contentView.update({
                    currRating: RatingOption.Disliked,
                    dislikes: this.viewQuery.dislikes + 1,
                });
                break;
        }

        this.network.addDislike(contentId).subscribe(val => {
            this.contentView.update({
                ratingsDoc: val,
                currRating: val.rating,
            });
        });
    }

    public setNoVote(contentId: string) {
        switch (this.viewQuery.currRating) {
            case RatingOption.Liked:
                this.contentView.update({
                    currRating: RatingOption.NoVote,
                    likes: this.viewQuery.likes - 1,
                });
                break;
            case RatingOption.Disliked:
                this.contentView.update({
                    currRating: RatingOption.NoVote,
                    dislikes: this.viewQuery.dislikes - 1,
                });
                break;
        }

        this.network.removeVote(contentId).subscribe(val => {
            this.contentView.update({
                ratingsDoc: val,
                currRating: val.rating,
            });
        });
    }
}
