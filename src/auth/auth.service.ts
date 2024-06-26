import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from 'src/otp/otp.service';
import jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
  ) {}

  async sendOtp(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        Memberships: {
          include: {
            Organizations: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const activeMembership = user.Memberships.find(
      (membership) => membership.isActive,
    );

    if (!activeMembership || !activeMembership.Organizations) {
      throw new UnauthorizedException(
        'User does not belong to an active organization',
      );
    }

    await this.otpService.sendOtp(email);
    return { message: 'OTP sent' };
  }

  async validateOtp(
    email: string,
    otp: string,
  ): Promise<{
    email: string;
    sub: number;
    organizationId: number;
    organizationName: string;
    role: string;
  }> {
    const data = this.otpService.getOtp(email);

    if (!data || data.otp !== otp.toString()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

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
    return {
      email: userWithMembershipAndOrg.email,
      sub: userId,
      organizationId: userHasMembership.organizationId,
      organizationName: organization.name,
      role: role,
    };
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.configService.get<string>('JWT_SECRET'));
    } catch (error) {
      throw new UnauthorizedException('Invalid Token');
    }
  }

  async verifyUser(token: string): Promise<{
    email: string;
    sub: number;
    organizationId: number;
    role: string;
  }> {
    const user = this.verifyToken(token);
    if (!user) {
      throw new UnauthorizedException('Ivalid token');
    }

    return user;
  }

  async verifyAdmin(token: string): Promise<any> {
    const user = this.verifyToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return user;
  }
}
