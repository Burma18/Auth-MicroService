import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { SendOtp, validateOtp } from './dto/auth.credentials.dto';
import { JwtInterceptor } from './interceptors/jwt.interceptor';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  async sendOtp(@Body() sendOtpDto: SendOtp) {
    return this.authService.sendOtp(sendOtpDto.email);
  }

  @Post('validate-otp')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(JwtInterceptor)
  async validateOtp(@Body() validateOtpDto: validateOtp) {
    return this.authService.validateOtp(
      validateOtpDto.email,
      validateOtpDto.otp,
    );
  }
}
