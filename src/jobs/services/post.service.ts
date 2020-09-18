import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MongoCrudService } from '../../mongo-rest/src/mongo-crud.service';
import { Post } from '../models/post.model';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { CompanyService } from './company.service';
import { TagService } from './tag.service';
import { PostDto } from '../dto/post.dto';
import { ErrorMessage } from '../../shared/messages/error.message';
import { Types } from 'mongoose';

@Injectable()
export class PostService extends MongoCrudService(Post) {
  constructor(
    @InjectModel(Post) public readonly postModel: ReturnModelType<typeof Post>,
    @Inject(forwardRef(() => CompanyService))
    private readonly companyService: CompanyService,
    @Inject(forwardRef(() => TagService))
    private readonly tagService: TagService,
  ) {
    super();
  }

  async create(dto: PostDto): Promise<Post> {
    const { companyId, postTags } = dto;
    if (!Types.ObjectId.isValid(companyId)) {
      throw new BadRequestException(ErrorMessage.INVALID_ID);
    }
    const company = await this.companyService.get(companyId);
    if (!company) {
      throw new NotFoundException(`${companyId} ${ErrorMessage.NOT_FOUND}`);
    }
    let tagIds = [];
    for (const tag of postTags) {
      if (Types.ObjectId.isValid(tag)) {
        const found = await this.tagService.get(tag);
        if (!found) {
          throw new NotFoundException(`${tag} ${ErrorMessage.NOT_FOUND}`);
        }
        tagIds.push(tag);
      } else {
        const created = await this.tagService.create({ name: tag });
        tagIds.push(created.id);
      }
    }
    let post = await super.create(dto);
    for (const tagId of tagIds) {
      post = await super.update(post.id, { $push: { tags: tagId } });
    }
    return post;
  }

  async delete(id: string): Promise<Post> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(ErrorMessage.INVALID_ID);
    }
    const post = await super.get(id);

    if (!post) {
      throw new NotFoundException(`${id} ${ErrorMessage.NOT_FOUND}`);
    }
    return await super.delete(id);
  }

  async update(id: string, dto: any): Promise<Post> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(ErrorMessage.INVALID_ID);
    }
    const post = await super.get(id);

    if (!post) {
      throw new NotFoundException(`${id} ${ErrorMessage.NOT_FOUND}`);
    }

    return await super.update(id, dto);
  }
}
