import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';
import moment from 'moment';
import { ErrorEnum } from '../error.enum'; // Import the ErrorEnum

@Injectable()
export class OtpService {
  private otpCache: Map<string, { otp: string; expiresAt: number }> = new Map();

  constructor(private readonly configService: ConfigService) {
    sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  generateOtp(): string {
    return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join(
      '',
    );
  }

  setOtp(email: string, otp: string): void {
    const expiresAt = moment().add(10, 'minutes').unix();
    this.otpCache.set(email, { otp, expiresAt });
  }

  getOtp(email: string): { otp: string; expiresAt: number } {
    const data = this.otpCache.get(email);
    if (!data) return null;

    if (moment().unix() > data.expiresAt) {
      this.otpCache.delete(email);
      return null;
    }

    return data;
  }

  async sendOtp(email: string): Promise<void> {
    try {
      const existingOtp = this.getOtp(email);
      if (existingOtp) {
        const currentTime = moment().unix();
        const timeRemaining = existingOtp.expiresAt - currentTime;
        if (timeRemaining > 0) {
          throw new UnauthorizedException(
            `${ErrorEnum.RETRY_OTP} in ${Math.ceil(timeRemaining / 60)} minutes.`,
          );
        }
      }
      const otp = this.generateOtp();
      this.setOtp(email, otp);

      const msg = {
        to: email,
        from: this.configService.get<string>('SENDGRID_SENDER_EMAIL'),
        subject: 'Your OTP Code',
        text: `Your OTP Code is ${otp}`,
        html: `<strong>Your OTP code is ${otp} </strong>`,
      };

      await sgMail.send(msg);
    } catch (error) {
      throw error;
    }
  }
}
