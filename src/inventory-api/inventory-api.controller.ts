import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { InventoryApiService } from './inventory-api.service';

@Controller('api/v1/experience')
export class InventoryApiController {
  constructor(private readonly inventoryApiService: InventoryApiService) {}

  @Get(':id/slots')
  async getSlots(
    @Param('id', ParseIntPipe) id: number,
    @Query('date') date: string,
  ) {
    if (!date) {
      throw new NotFoundException('Date parameter is required');
    }

    return this.inventoryApiService.getSlots(id, date);
  }

  @Get(':id/dates')
  async getDates(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryApiService.getAvailableDates(id);
  }
}
