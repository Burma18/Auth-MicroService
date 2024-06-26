import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import jwt from 'jsonwebtoken';

@Injectable()
export class JwtInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const { email, sub, organizationId, organizationName, role } = data;
        const payload = { email, sub, organizationId, role };

        const token = jwt.sign(
          payload,
          this.configService.get<string>('JWT_SECRET'),
          { expiresIn: '24h' },
        );

        const response = context.switchToHttp().getResponse();
        response.cookie('session', token, { httpOnly: true });

        return { redirectUrl: `${organizationName}` };
      }),
    );
  }
}
