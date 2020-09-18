import { Injectable } from '@nestjs/common';

@Injectable()
export class SharedService {
  constructor() {}

  generateRandomHash(): string {
    return (
      Math.random()
        .toString(36)
        .substr(2) +
      Math.random()
        .toString(36)
        .substr(2)
    );
  }
}
