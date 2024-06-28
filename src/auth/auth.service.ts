import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from 'src/otp/otp.service';
import { ErrorEnum } from '../error.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
  ) {}

  async sendOtp(email: string): Promise<{ message: string }> {
    try {
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
        throw new UnauthorizedException(ErrorEnum.USER_NOT_FOUND);
      }

      const activeMembership = user.Memberships.find(
        (membership) => membership.isActive,
      );

      if (!activeMembership || !activeMembership.Organizations) {
        throw new UnauthorizedException(ErrorEnum.NO_ACTIVE_ORGANIZATION);
      }

      await this.otpService.sendOtp(email);
      return { message: 'OTP sent' };
    } catch (error) {
      throw error;
    }
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
    try {
      const data = this.otpService.getOtp(email);

      if (!data || data.otp !== otp.toString()) {
        throw new UnauthorizedException(ErrorEnum.INVALID_OR_EXPIRED_OTP);
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
        throw new UnauthorizedException(ErrorEnum.USER_NOT_FOUND);
      }

      const { id: userId, role, Memberships } = userWithMembershipAndOrg;
      const userHasMembership = Memberships.find((m) => m.isActive);

      if (!userHasMembership) {
        throw new UnauthorizedException(ErrorEnum.NO_MEMBERSHIP);
      }

      const organization = userHasMembership.Organizations;

      if (!organization) {
        throw new UnauthorizedException(ErrorEnum.NO_ORGANIZATION);
      }
      return {
        email: userWithMembershipAndOrg.email,
        sub: userId,
        organizationId: userHasMembership.organizationId,
        organizationName: organization.name,
        role: role,
      };
    } catch (error) {
      throw error;
    }
  }
}
