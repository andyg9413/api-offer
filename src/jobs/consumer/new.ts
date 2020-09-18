import { Injectable } from '@nestjs/common';
import { PostService } from '../services/post.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class NewWhenService {
  constructor(private readonly postService: PostService) {}
  @Cron('59 59 23 * * *')
  async updateNewField(): Promise<any> {
    const date: any = new Date(Date.now());

    const queryDate = new Date(date - 1440 * 60000);
    await this.postService.postModel.update(
      { createdAt: { $lte: queryDate } },
      { new: false, $inc: { when: 1 } },
    );
    const posts = await this.postService.getAll(
      { skip: 0, limit: -1 },
      { createdAt: { $lte: queryDate }, when: { $lt: 7 } },
    );
    for (const post of posts) {
      const when = post.when;
      await this.postService.update(post.id, { antiquity: `${when}d ago` });
    }
    await this.postService.postModel.update(
      { when: 7 },
      { antiquity: '1w ago' },
    );
    await this.postService.postModel.update(
      { when: 14 },
      { antiquity: '2w ago' },
    );
    await this.postService.postModel.update(
      { when: 21 },
      { antiquity: '3w ago' },
    );
    await this.postService.postModel.update(
      { when: 28 },
      { antiquity: '1mo ago' },
    );
    await this.postService.postModel.update(
      { when: 35 },
      { antiquity: 'Long time ago' },
    );
    return true;
  }
}
