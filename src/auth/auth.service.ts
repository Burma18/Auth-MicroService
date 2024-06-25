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

  getOtp(email: string): { otp: string; expiresAt: number } {
    const data = this.otpCache.get(email);
    if (!data) return null;

    if (moment().unix() > data.expiresAt) {
      this.otpCache.delete(email);
      return null;
    }

    return data;
  }

  async sendOtp(email: string): Promise<{ message: string }> {
    const existingOtp = this.getOtp(email);
    if (existingOtp) {
      const currentTime = moment().unix();
      const timeRemaining = existingOtp.expiresAt - currentTime;

      if (timeRemaining > 0) {
        throw new UnauthorizedException(
          `You have already requested OTP. Please try again in ${Math.ceil(timeRemaining / 60)} minutes.`,
        );
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { Organizations: true },
    });

    console.log({ user });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const otp = this.generateOtp();
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
    const data = this.getOtp(email);

    if (data.otp !== otp.toString()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    this.otpCache.delete(email);

    const userWithMembershipAndOrg = await this.prisma.user.findUnique({
      where: { email },
      include: {
        Organizations: true,
        Memberships: {
          include: {
            Organizations: true,
          },
        },
      },
    });

    if (!userWithMembershipAndOrg) {
      throw new UnauthorizedException('User not found');
    }

    const { id: userId, role, Memberships } = userWithMembershipAndOrg;
    const userHasMembership = Memberships.find((m) => m.isActive);

    if (!userHasMembership) {
      throw new UnauthorizedException('User membership not found');
    }

    const organization = userHasMembership.Organizations;

    if (!organization) {
      throw new UnauthorizedException('Organization not found');
    }

    const payload = {
      email: userWithMembershipAndOrg.email,
      sub: userId,
      organizationId: userHasMembership.organizationId,
      role: role,
    };
    const token = jwt.sign(
      payload,
      this.configService.get<string>('JWT_SECRET'),
      { expiresIn: '24h' },
    );

    return {
      status: 200,
      redirectUrl: `https://${organization.name}`,
      token,
    };
  }
}
