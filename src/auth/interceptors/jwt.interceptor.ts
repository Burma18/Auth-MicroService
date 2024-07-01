import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const { email, sub, organizationId, organizationName, role } = data;
        const payload = { email, sub, organizationId, role };

        const token = this.jwtService.sign(payload);

        const response = context.switchToHttp().getResponse();

        response.cookie('session', token, { httpOnly: true });

        if (context.getHandler().name === 'validateOtp') {
          return { redirectUrl: `${organizationName}` };
        } else {
          return { message: 'Login successful' };
        }
      }),
    );
  }
}
