import { Module } from '@nestjs/common';
import { InventoryApiService } from './inventory-api.service';
import { InventoryApiController } from './inventory-api.controller';

@Module({
  providers: [InventoryApiService],
  controllers: [InventoryApiController]
})
export class InventoryApiModule {}
