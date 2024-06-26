import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { OtpModule } from 'src/otp/otp.module';

@Module({
  imports: [PrismaModule, ConfigModule, OtpModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
