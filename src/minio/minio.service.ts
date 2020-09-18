import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import * as fs from 'fs';
import { Client, ClientOptions } from 'minio';
import { ConfigService } from '@nestjs/config';
import { Stream } from 'stream';
import { ENV_NAMES } from '../shared/configuration/env.enum';
import { ConstantsEnum } from '../shared/configuration/constants.enum';
import { ErrorMessage } from '../shared/messages/error.message';
import { SharedService } from '../shared/services/shared.service';

@Injectable()
export class MinioService {
  client: Client;

  metaData = {};

  constructor(
    private readonly sharedService: SharedService,
    private readonly configService: ConfigService,
  ) {
    this.client = new Client(this.getClientConfig());
  }

  getClientConfig(): any {
    const baseConfig: ClientOptions = {
      endPoint: this.configService.get<string>(ENV_NAMES.STORAGE_HOST),
      accessKey: this.configService.get<string>(ENV_NAMES.STORAGE_ACCESS_KEY),
      secretKey: this.configService.get<string>(ENV_NAMES.STORAGE_SECRET_KEY),
    };

    const port = parseInt(
      this.configService.get<string>(ENV_NAMES.STORAGE_PORT),
      10,
    );
    return this.configService.get<string>(ENV_NAMES.STORAGE) ===
      ConstantsEnum.S3
      ? baseConfig
      : {
          ...baseConfig,
          port: port,
          useSSL: false,
        };
  }

  async save(
    fileName: string,
    bucketName: string,
    file: any,
    path: string,
  ): Promise<string> {
    try {
      const extension = fileName.split('.')[1];
      const hash =
        path +
        '/' +
        Date.now() +
        this.sharedService.generateRandomHash() +
        '.' +
        extension;
      await this.client.putObject(bucketName, hash, file, this.metaData);
      return hash.split('/')[1];
    } catch {
      throw new BadRequestException(ErrorMessage.BAD_REQUEST);
    }
  }

  async load(
    imagePath: string,
    fileName: string,
    bucketName: string,
    encoding = false,
  ): Promise<Stream | any> {
    try {
      let file: Stream = fs.createReadStream(
        process.cwd() + '/src/assets/img/no-photo.png',
      );
      file = await this.client.getObject(
        bucketName,
        imagePath + '/' + fileName,
      );
      if (encoding) {
        const encode = await this.streamToString(file, 'base64');

        const mimeType = await this.getMimeType(fileName);

        const type = `data:${mimeType};charset=utf-8;base64,`;

        return type + encode;
      }
      return file;
    } catch {
      throw new HttpException(ErrorMessage.BAD_REQUEST, HttpStatus.NOT_FOUND);
    }
  }

  private async streamToString(
    stream: Stream,
    encoding = 'base64',
  ): Promise<string> {
    const chunks = [];

    return new Promise((resolve, reject) => {
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks).toString(encoding)));
    });
  }

  private async getMimeType(filename: string): Promise<string | null> {
    let mimeType = null;
    if (filename) {
      const regx = /(?:\.([^.]+))?$/;
      const extension = regx.exec(filename)[1];
      switch (extension) {
        case 'png':
          mimeType = 'image/png';
          break;
        case 'gif':
          mimeType = 'image/gif';
          break;
        case 'jpg':
          mimeType = 'image/jpg';
          break;
        case 'jpeg':
          mimeType = 'image/jpeg';
          break;
        default:
          mimeType = null;
      }
    }
    return mimeType;
  }
}
