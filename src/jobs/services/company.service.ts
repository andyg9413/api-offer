import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MongoCrudService } from '../../mongo-rest/src/mongo-crud.service';
import { Company } from '../models/company.model';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { MinioService } from '../../minio/minio.service';
import { ConfigService } from '@nestjs/config';
import { CompanyDto } from '../dto/company.dto';
import { ErrorMessage } from '../../shared/messages/error.message';
import { Types } from 'mongoose';
import { PostService } from './post.service';
import { asap } from 'rxjs/internal/scheduler/asap';

@Injectable()
export class CompanyService extends MongoCrudService(Company) {
  constructor(
    @InjectModel(Company)
    private readonly companyModel: ReturnModelType<typeof Company>,
    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
  ) {
    super();
  }

  async create(dto: any): Promise<Company> {
    const company = await this.companyModel.findOne({ name: dto.name });
    if (company) {
      throw new ConflictException(ErrorMessage.COMPANY_ALREADY_EXISTS);
    }

    return this.companyModel.create(dto);
  }

  async delete(id: string): Promise<Company> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(ErrorMessage.INVALID_ID);
    }
    const company = await super.get(id);
    if (!company) {
      throw new NotFoundException(`${id} ${ErrorMessage.NOT_FOUND}`);
    }
    const post = await this.postService.getOne({ company: id });
    if (post) {
      throw new ConflictException(ErrorMessage.COMPANY_WITH_OFFERS);
    }
    return await super.delete(id);
  }
  async update(id: string, dto: any): Promise<Company> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(ErrorMessage.INVALID_ID);
    }
    const company = await super.get(id);
    if (!company) {
      throw new NotFoundException(`${id} ${ErrorMessage.NOT_FOUND}`);
    }
    return await super.update(id, dto);
  }
}
