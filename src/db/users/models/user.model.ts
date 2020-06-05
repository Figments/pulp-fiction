export interface User {
    readonly id: string;
    readonly email: string;
    readonly username: string;
    readonly password: string;
    readonly profile: {
        readonly avatar: string;
        readonly themePref: string;
        readonly bio: string | null;
        readonly tagline: string | null;
    };
    readonly stats: {
        readonly works: number;
        readonly blogs: number;
        readonly subscribers: number;
        readonly subscriptions: number;
    };
    readonly audit: {
        readonly roles: string[];
        readonly sessions: {
            readonly sessionId: string;
            readonly expiresAt: Date;
        }[] | null;
    };
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
