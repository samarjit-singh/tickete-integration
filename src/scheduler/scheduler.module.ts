import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { ApiIntegrationModule } from 'src/api-integration/api-integration.module';

@Module({
  imports: [ScheduleModule.forRoot(), ApiIntegrationModule],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
