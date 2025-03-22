import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiIntegrationService } from '../api-integration/api-integration.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly apiIntegrationService: ApiIntegrationService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailySync() {
    this.logger.log('Running daily sync for the next 30 days');
    await this.apiIntegrationService.syncForNextMonth();
  }

  @Cron(CronExpression.EVERY_4_HOURS)
  async handleFourHourlySync() {
    this.logger.log('Running 4-hourly sync for the next 7 days');
    await this.apiIntegrationService.syncForNextWeek();
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleFifteenMinuteSync() {
    this.logger.log('Running 10-minute sync for today');
    await this.apiIntegrationService.syncForToday();
  }

  //   for initial sync on app start
  async triggerInitialSync() {
    this.logger.log('Triggering initial data sync');
    await this.apiIntegrationService.syncForNextMonth();
  }
}
