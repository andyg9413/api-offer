import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { MongoCrudService } from '../../mongo-rest/src/mongo-crud.service';
import { Tag } from '../models/tag.model';
import { TagDto } from '../dto/tag.dto';
import { ErrorMessage } from '../../shared/messages/error.message';
import { Types } from 'mongoose';
import { PostService } from './post.service';
import { Company } from '../models/company.model';

@Injectable()
export class TagService extends MongoCrudService(Tag) {
  constructor(
    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
  ) {
    super();
  }
  async create(dto: TagDto): Promise<Tag> {
    const tag = await super.getOne({ name: dto.name });
    if (tag) {
      throw new ConflictException(`${dto.name} ${ErrorMessage.ALREADY_EXISTS}`);
    }
    return await super.create(dto);
  }
  async delete(id: string): Promise<Tag> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(ErrorMessage.INVALID_ID);
    }
    const tag = await super.get(id);
    if (!tag) {
      throw new NotFoundException(`${id} ${ErrorMessage.NOT_FOUND}`);
    }
    const posts = await this.postService.getAll(
      { skip: 0, limit: -1 },
      { tags: { $in: id } },
    );
    if (posts.length > 0) {
      throw new ConflictException(ErrorMessage.TAG_IN_USE);
    }
    return super.delete(id);
  }

  async update(id: string, dto: any): Promise<Company> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(ErrorMessage.INVALID_ID);
    }
    const tag = await super.get(id);
    if (!tag) {
      throw new NotFoundException(`${id} ${ErrorMessage.NOT_FOUND}`);
    }
    return await super.update(id, dto);
  }
}
