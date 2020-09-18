import { prop } from '@typegoose/typegoose';

export class Company {
  id?: string;

  @prop({ default: () => new Date(new Date().toUTCString()) })
  createdAt?: Date;

  @prop({ default: () => new Date(new Date().toUTCString()) })
  updatedAt?: Date;

  @prop()
  name: string;

  @prop()
  imageUrl: string;
}
