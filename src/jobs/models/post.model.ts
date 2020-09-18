import { arrayProp, prop, Ref } from '@typegoose/typegoose';
import { PostType } from './post-type.enum';
import { Tag } from './tag.model';

export class Post {
  id?: string;

  @prop({ default: () => new Date(new Date().toUTCString()) })
  createdAt?: Date;

  @prop({ default: () => new Date(new Date().toUTCString()) })
  updatedAt?: Date;

  @prop()
  title: string;

  @prop({ enum: PostType })
  type: PostType;

  @prop()
  location: string;

  @prop({ required: false })
  when?: number;

  @prop({ itemsRef: Tag })
  tags: Array<Ref<Tag>>;

  @prop()
  companyId: string;

  @prop({ default: true })
  new: boolean;

  @prop({ default: false })
  featured: boolean;

  @prop()
  antiquity: string;
}
