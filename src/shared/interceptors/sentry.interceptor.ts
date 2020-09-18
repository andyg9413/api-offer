import {
  ExecutionContext,
  Injectable,
  NestInterceptor,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as Sentry from '@sentry/minimal';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap({
        error: exception => {
          const request = context.switchToHttp().getRequest();
          const notTrackedStatus = [409];
          if (!notTrackedStatus.includes(exception.status)) {
            Sentry.captureException({
              url: request.url,
              method: request.method,
              body: request.body,
              user: request.user,
              error: exception,
            });
          }
        },
      }),
    );
  }
}
