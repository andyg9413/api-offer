import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PostType } from '../models/post-type.enum';

export class PostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(PostType)
  @IsNotEmpty()
  type: PostType;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsNotEmpty({ each: true })
  postTags: string[];

  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;
}
