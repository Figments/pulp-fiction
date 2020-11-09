import { Module } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Schema } from 'mongoose';

import { CommentsSchema } from './comments.schema';
import { CommentsService } from './comments.service';

import { BlogsModule } from '../blogs/blogs.module';
import { WorksModule } from '../works/works.module';
import { ContentModule } from '../content/content.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    BlogsModule, WorksModule, ContentModule,
    MongooseModule.forFeature([
      {name: 'Comment', schema: CommentsSchema},
    ]),
    NotificationsModule
  ],
  providers: [
    CommentsService,
    {
      provide: getModelToken('BlogComment'),
      useFactory: commentModel => commentModel.discriminator('BlogComment', new Schema({
        blogId: {type: String, ref: 'Blog', required: true, index: true}
      })),
      inject: [getModelToken('Comment')]
    },
    {
      provide: getModelToken('WorkComment'),
      useFactory: commentModel => commentModel.discriminator('WorkComment', new Schema({
        workId: {type: String, ref: 'Work', required: true, index: true}
      })),
      inject: [getModelToken('Comment')]
    },
    {
      provide: getModelToken('ContentComment'),
      useFactory: commentModel => commentModel.discriminator('ContentComment', new Schema({
        contentId: {type: String, ref: 'Content', required: true, index: true}
      })),
      inject: [getModelToken('Comment')]
    }
  ],
  exports: [CommentsService]
})
export class CommentsModule {}
