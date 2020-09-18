import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerMessage } from '../../shared/messages/swagger.message';
import { CrudController } from '../../mongo-rest/src/crud.controller';
import { TagService } from '../services/tag.service';
import { Tag } from '../models/tag.model';
import { TagDto } from '../dto/tag.dto';

@Controller('tag')
@ApiTags(SwaggerMessage.Tag)
export class TagController extends CrudController(TagService, {
  modelDto: Tag,
  createDto: TagDto,
}) {}
