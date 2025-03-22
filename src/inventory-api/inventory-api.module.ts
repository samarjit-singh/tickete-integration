import { Module } from '@nestjs/common';
import { InventoryApiService } from './inventory-api.service';
import { InventoryApiController } from './inventory-api.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [InventoryApiService],
  controllers: [InventoryApiController],
})
export class InventoryApiModule {}
