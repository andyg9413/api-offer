import { Controller, Get, Param, Query } from '@nestjs/common';
import { MinioService } from './minio.service';
import {
  ApiConflictResponse,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { SwaggerMessage } from '../shared/messages/swagger.message';
import { ENV_NAMES } from '../shared/configuration/env.enum';
import { InternalServerErrorDto } from '../shared/dtos/internal-server-error.dto';
import { ConflictErrorDto } from '../shared/dtos/conflict-error.dto';

@Controller('minio')
@ApiTags(SwaggerMessage.Minio)
export class MinioController {
  constructor(
    private readonly minioService: MinioService,
    private readonly configService: ConfigService,
  ) {}

  @Get('static/download/:path')
  @ApiResponse({
    status: 200,
    description: 'Returns the stream of the file',
  })
  @ApiConflictResponse({ description: 'Bad request', type: ConflictErrorDto })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: InternalServerErrorDto,
  })
  @ApiConsumes('multipart/form-data')
  async downloadFromStatic(
    @Param('path') path: string,
    @Query('encode') encode = false,
  ): Promise<any> {
    let fileObject = await this.minioService.load(
      this.configService.get<string>(ENV_NAMES.STORAGE_PUBLIC),
      path,
      this.configService.get<string>(ENV_NAMES.STORAGE_BUCKET),
      encode,
    );
    return fileObject;
  }
}
