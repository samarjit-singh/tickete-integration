import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiIntegrationModule } from './api-integration/api-integration.module';
import { InventoryApiModule } from './inventory-api/inventory-api.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [ApiIntegrationModule, InventoryApiModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
