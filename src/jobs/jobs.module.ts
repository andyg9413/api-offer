import { Module } from '@nestjs/common';
import { CompanyService } from './services/company.service';
import { CompanyController } from './controllers/company.controller';
import { TypegooseModule } from 'nestjs-typegoose';
import { Company } from './models/company.model';
import { MinioModule } from '../minio/minio.module';
import { TagService } from './services/tag.service';
import { TagController } from './controllers/tag.controller';
import { Tag } from './models/tag.model';
import { PostService } from './services/post.service';
import { PostController } from './controllers/post.controller';
import { Post } from './models/post.model';
import { NewWhenService } from './consumer/new';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypegooseModule.forFeature([Company, Tag, Post]),
    MinioModule,
    ScheduleModule.forRoot(),
  ],
  providers: [CompanyService, TagService, PostService, NewWhenService],
  controllers: [CompanyController, TagController, PostController],
})
export class JobsModule {}
