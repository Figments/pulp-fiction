import { Categories } from './categories.enum';
import { Fandoms } from './fandoms.enum';
import { GenresFiction, GenresPoetry } from './genres.enum';
import { ContentRating } from './content-rating.enum';
import { WorkStatus } from './work-status.enum';
import { ApprovalStatus } from './approval-status.enum';

export interface Work {
    readonly _id: string;
    readonly author: {
        readonly _id: string;
        readonly username: string;
        readonly profile: {
            readonly avatar: string;
        };
    };
    readonly title: string;
    readonly shortDesc: string;
    readonly longDesc: string;
    readonly meta: {
        readonly category: Categories;
        readonly fandoms?: Fandoms[];
        readonly genres: GenresFiction[] | GenresPoetry[];
        readonly rating: ContentRating;
        readonly status: WorkStatus;
        readonly coverart: string;
    };
    readonly stats: {
        readonly totWords: number;
        readonly likes: number;
        readonly dislikes: number;
        readonly views: number;
        readonly comments: number;
    };
    readonly sections: SectionInfo[];
    readonly audit: {
        readonly threadId: string;
        readonly published: ApprovalStatus;
    };
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export interface SectionInfo {
    readonly _id: string;
    readonly title: string;
    readonly published: boolean;
    readonly stats: {
        readonly words: number;
    };
}