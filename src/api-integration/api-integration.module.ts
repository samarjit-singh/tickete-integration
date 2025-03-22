import { Module } from '@nestjs/common';
import { ApiIntegrationService } from './api-integration.service';

@Module({
  providers: [ApiIntegrationService]
})
export class ApiIntegrationModule {}
