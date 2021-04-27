import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersSchema } from './users.schema';
import { UsersStore } from './users.store';
import { InviteCodesSchema } from './invite-codes.schema';
import { CollectionsModule } from '../collections/collections.module';

@Module({
    imports: [
        CollectionsModule,
        MongooseModule.forFeature([
            { name: 'User', schema: UsersSchema },
            { name: 'InviteCodes', schema: InviteCodesSchema },
        ]),
    ],
    providers: [UsersStore],
    exports: [UsersStore],
})
export class UsersModule {}
