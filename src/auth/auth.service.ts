import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as sgMail from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';

@Injectable()
export class AuthService {
  private otpCache: Map<string, { otp: string; expiresAt: number }> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && bcrypt.compareSync(password, user.password)) {
      return user;
    }
    return null;
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

  getOtp(email: string): string | null {
    const data = this.otpCache.get(email);
    if (!data) return null;

    if (moment().unix() > data.expiresAt) {
      this.otpCache.delete(email);
      return null;
    }

    return data.otp;
  }

  async sendOtp(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    console.log({ user });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const otp = this.generateOtp();

    console.log({ otp });
    this.setOtp(email, otp);

    const msg = {
      to: email,
      from: this.configService.get<string>('SENDGRID_SENDER_EMAIL'),
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`,
      html: `<strong>Your OTP code is ${otp}</strong>`,
    };

    console.log({ msg });

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new UnauthorizedException('Unable to send OTP');
    }

    return { message: 'OTP sent' };
  }

  async validateOtp(
    email: string,
    otp: string,
  ): Promise<{ status: number; redirectUrl: string; token: string }> {
    const storedOtp = this.getOtp(email);

    console.log({ storedOtp, otp });
    if (storedOtp !== otp.toString()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    this.otpCache.delete(email);

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      organizationId: user.organizationId,
    };
    const token = jwt.sign(
      payload,
      this.configService.get<string>('JWT_SECRET'),
      { expiresIn: '1h' },
    );

    console.log({ payload, token });

    return {
      status: 200,
      redirectUrl: `https://${user.organization.domain}`,
      token,
    };
  }
}
