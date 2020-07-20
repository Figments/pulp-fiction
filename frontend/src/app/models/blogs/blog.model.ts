export interface Blog {
    readonly _id: string;
    readonly author: {
        readonly _id: string;
        readonly username: string;
        readonly profile: {
            readonly avatar: string;
        };
    };
    readonly title: string;
    readonly body: string;
    readonly published: boolean;
    readonly stats: {
        readonly comments: number;
        readonly views: number;
        readonly words: number;
    };
    readonly audit: {
        readonly isDeleted: boolean;
    };
    readonly createdAt: Date;
    readonly updatedAt: Date;
}