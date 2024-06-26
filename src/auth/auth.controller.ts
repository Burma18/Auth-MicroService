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
import {
  SendOtp,
  VerifyTokenDto,
  validateOtp,
} from './dto/auth.credentials.dto';
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

  @Post('verify-user')
  @HttpCode(HttpStatus.OK)
  async verifyUser(@Body() verifyTokenDto: VerifyTokenDto) {
    await this.authService.verifyUser(verifyTokenDto.token);
  }

  @Post('verify-admin')
  @HttpCode(HttpStatus.OK)
  async verifyAdmin(@Body() verifyTokenDto: VerifyTokenDto) {
    await this.authService.verifyAdmin(verifyTokenDto.token);
  }
}
