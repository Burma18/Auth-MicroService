import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  async sendOtp(@Body('email') email: string) {
    return this.authService.sendOtp(email);
  }

  @Post('validate-otp')
  @HttpCode(HttpStatus.OK)
  async validateOtp(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Res() res,
  ) {
    const result = await this.authService.validateOtp(email, otp);
    res.cookie('session', result.token, { httpOnly: true });
    return res.send({ redirectUrl: result.redirectUrl });
  }
}
