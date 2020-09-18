import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypegooseModule } from 'nestjs-typegoose';
import { ENV_NAMES } from './shared/configuration/env.enum';
import * as dotenv from 'dotenv';
dotenv.config();
import { SharedModule } from './shared/shared.module';
import { MinioModule } from './minio/minio.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    TypegooseModule.forRoot(process.env[ENV_NAMES.MONGO_URI], {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    MinioModule,
    JobsModule,
  ],
})
export class AppModule {}
