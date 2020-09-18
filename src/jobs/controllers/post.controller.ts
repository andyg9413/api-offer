import { Controller, Get, Param, Put, Query } from '@nestjs/common';
import { CrudController } from '../../mongo-rest/src/crud.controller';
import { PostService } from '../services/post.service';
import { Post } from '../models/post.model';
import { PostDto } from '../dto/post.dto';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { SwaggerMessage } from '../../shared/messages/swagger.message';
import { GetAllQueryDto, GetAllResponseDto } from '../../mongo-rest/src/dto';
import { RequestParserService } from '../../mongo-rest/src/request-parser.service';

@Controller('post')
@ApiTags(SwaggerMessage.Post)
export class PostController extends CrudController(PostService, {
  createDto: PostDto,
  modelDto: Post,
}) {
  constructor(private readonly postService: PostService) {
    super();
  }

  @Get()
  @ApiParam({ name: 'tags', required: false })
  async getAll(
    @Query() query: GetAllQueryDto,
    @Query('tags') tags: string,
  ): Promise<GetAllResponseDto> {
    const queryParsed = RequestParserService.parseQuery(query);
    if (tags) {
      const tagsArray = tags.split(',');
      const data = await this.postService.getAll(
        queryParsed,
        { tags: { $in: tagsArray } },
        { createdAt: -1 },
      );
      const total = await this.postService.count(queryParsed, {
        tags: { $in: tagsArray },
      });
      return {
        data,
        count: data.length,
        total,
      };
    }
    const data = await this.postService.getAll(
      queryParsed,
      {},
      { createdAt: -1 },
    );
    const total = await this.postService.count(queryParsed);
    return {
      data,
      count: data.length,
      total,
    };
  }
}
