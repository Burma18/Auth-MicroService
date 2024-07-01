import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from 'src/otp/otp.service';
import { ErrorEnum } from '../error.enum';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

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
      this.logger.error(`Error in sendOtp: ${error.message}`, error.stack);
      throw new UnauthorizedException(ErrorEnum.ERROR_SEND_OTP);
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

      const payload = {
        email: userWithMembershipAndOrg.email,
        sub: userId,
        organizationId: userHasMembership.organizationId,
        organizationName: organization.name,
        role: role,
      };

      return payload;
    } catch (error) {
      this.logger.error(`Error in validateOtp: ${error.message}`, error.stack);
      throw new UnauthorizedException(ErrorEnum.ERROR_VALIDATE_OTP);
    }
  }

  async loginAdmin(email: string, password: string) {
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

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException(ErrorEnum.INVALID_CREDENTIALS);
      }

      if (user.role !== 'ADMIN') {
        throw new ForbiddenException(ErrorEnum.USER_NOT_ADMIN);
      }

      const activeMembership = user.Memberships.find(
        (membership) => membership.isActive,
      );

      if (!activeMembership || !activeMembership.Organizations) {
        throw new UnauthorizedException(ErrorEnum.NO_ACTIVE_ORGANIZATION);
      }

      const organization = activeMembership.Organizations;

      if (!organization.isActive) {
        throw new UnauthorizedException(ErrorEnum.NO_ACTIVE_ORGANIZATION);
      }

      const payload = {
        email: user.email,
        sub: user.id,
        organizationId: organization.id,
        role: user.role,
      };

      return payload;
    } catch (error) {
      this.logger.error(`Error in loginAuth: ${error.message}`, error.stack);
      throw new ForbiddenException(ErrorEnum.LOGIN_AUTHENTICATION_FAILED);
    }
  }
}
