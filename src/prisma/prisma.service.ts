import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

export enum PrismaServiceError {
  DatabaseConnectionError = 'Failed to connect to the database',
  DatabaseDisconnectionError = 'Failed to disconnect from the database',
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    try {
      this.configService.get<string>('DATABASE_URL');
      await this.$connect();
    } catch (error) {
      throw new Error(PrismaServiceError.DatabaseConnectionError);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (error) {
      throw new Error(PrismaServiceError.DatabaseDisconnectionError);
    }
  }
}
