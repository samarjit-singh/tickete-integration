import { Module } from '@nestjs/common';
import { ApiIntegrationService } from './api-integration.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [ApiIntegrationService],
  exports: [ApiIntegrationService],
})
export class ApiIntegrationModule {}
