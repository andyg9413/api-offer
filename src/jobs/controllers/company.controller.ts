import {
  BadRequestException,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CrudController } from '../../mongo-rest/src/crud.controller';
import { CompanyService } from '../services/company.service';
import { CompanyDto } from '../dto/company.dto';
import { Company } from '../models/company.model';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { ErrorMessage } from '../../shared/messages/error.message';
import { MinioService } from '../../minio/minio.service';
import { ConfigService } from '@nestjs/config';
import { ENV_NAMES } from '../../shared/configuration/env.enum';
import { SwaggerMessage } from '../../shared/messages/swagger.message';

@Controller('company')
@ApiTags(SwaggerMessage.Company)
export class CompanyController extends CrudController(CompanyService, {
  createDto: CompanyDto,
  modelDto: Company,
}) {
  constructor(
    private readonly companyService: CompanyService,
    private readonly minioService: MinioService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  @Post('upload/image/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file,
  ): Promise<Company> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(ErrorMessage.BAD_REQUEST);
    }
    const company = await this.companyService.get(id);
    if (!company) {
      throw new NotFoundException(`${id} ${ErrorMessage.NOT_FOUND}`);
    }
    if (!file) {
      throw new BadRequestException(ErrorMessage.BAD_REQUEST);
    }

    let fileUrl;

    try {
      fileUrl = await this.minioService.save(
        file.originalname,
        this.configService.get<string>(ENV_NAMES.STORAGE_BUCKET),
        file.buffer,
        id,
      );
    } catch {
      throw new ConflictException(ErrorMessage.BAD_REQUEST);
    }
    return await this.companyService.update(id, { imageUrl: fileUrl });
  }
}
