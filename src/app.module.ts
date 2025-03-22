import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiIntegrationModule } from './api-integration/api-integration.module';
import { InventoryApiModule } from './inventory-api/inventory-api.module';
import { PrismaService } from './prisma/prisma.service';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SchedulerService } from './scheduler/scheduler.service';

@Module({
  imports: [ApiIntegrationModule, InventoryApiModule, SchedulerModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly schedulerService: SchedulerService) {}

  async onModuleInit() {
    await this.schedulerService.triggerInitialSync();
  }
}
