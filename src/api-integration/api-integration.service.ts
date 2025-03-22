import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

import { addDays, format } from 'date-fns';

interface PaxAvailability {
  type: string;
  name: string;
  description: string;
  min: number;
  max: number;
  remaining: number;
  price: {
    finalPrice: number;
    originalPrice: number;
    currencyCode: string;
  };
}

interface SlotData {
  startTime: string;
  endTime: string;
  providerSlotId: string;
  remaining: number;
  currencyCode: string;
  variantId: number;
  paxAvailability: PaxAvailability[];
}

@Injectable()
export class ApiIntegrationService {
  private readonly logger = new Logger(ApiIntegrationService.name);
  private readonly apiKey: string;
  private readonly baseApiUrl = 'https://leap-api.tickete.co/api/v1/inventory';
  private readonly productIds = [14, 15];

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.apiKey = this.configService.get<string>('API_KEY') || '';

    this.initializeProducts();
  }

  private async initializeProducts(): Promise<void> {
    for (const productId of this.productIds) {
      const existingProduct = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!existingProduct) {
        await this.prisma.product.create({
          data: { id: productId },
        });
        this.logger.log(`Product with ID ${productId} initialized`);
      }
    }
  }

  async fetchInventoryForProduct(
    productId: number,
    date: string,
  ): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseApiUrl}/${productId}?date=${date}`,
        {
          headers: {
            'x-api-key': this.apiKey,
          },
        },
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Error fetching inventory for product ${productId} on date ${date}: ${error}`,
      );
      throw error;
    }
  }

  async saveInventoryData(
    productId: number,
    date: string,
    data: SlotData[],
  ): Promise<void> {
    if (!data || data.length === 0) {
      this.logger.log(
        `No inventory data found for product ${productId} on date ${date}`,
      );
      return;
    }

    try {
      const inventory = await this.prisma.inventory.upsert({
        where: {
          productId_date: {
            productId,
            date: new Date(date),
          },
        },
        update: {
          lastUpdated: new Date(),
        },
        create: {
          productId,
          date: new Date(date),
          lastUpdated: new Date(),
        },
      });

      for (const slotData of data) {
        const slot = await this.prisma.slot.upsert({
          where: {
            inventoryId_startTime: {
              inventoryId: inventory.id,
              startTime: slotData.startTime,
            },
          },
          update: {
            endTime: slotData.endTime,
            providerSlotId: slotData.providerSlotId,
            remaining: slotData.remaining,
            currencyCode: slotData.currencyCode,
            variantId: slotData.variantId,
          },
          create: {
            inventoryId: inventory.id,
            startTime: slotData.startTime,
            endTime: slotData.endTime,
            providerSlotId: slotData.providerSlotId,
            remaining: slotData.remaining,
            currencyCode: slotData.currencyCode,
            variantId: slotData.variantId,
          },
        });

        await this.prisma.paxAvailability.deleteMany({
          where: { slotId: slot.id },
        });

        for (const paxData of slotData.paxAvailability) {
          await this.prisma.paxAvailability.create({
            data: {
              slotId: slot.id,
              type: paxData.type,
              name: paxData.name,
              description: paxData.description,
              min: paxData.min,
              max: paxData.max,
              remaining: paxData.remaining,
              finalPrice: paxData.price.finalPrice,
              originalPrice: paxData.price.originalPrice,
              currencyCode: paxData.price.currencyCode,
            },
          });
        }
      }

      this.logger.log(
        `Successfully saved inventory data for product ${productId} on date ${date}`,
      );
    } catch (error) {
      this.logger.error(
        `Error saving inventory data for product ${productId} on date ${date}: ${error}`,
      );
      throw error;
    }
  }

  async fetchAndSaveInventory(productId: number, date: string): Promise<void> {
    try {
      const data: SlotData[] = await this.fetchInventoryForProduct(
        productId,
        date,
      );
      await this.saveInventoryData(productId, date, data);
    } catch (error) {
      this.logger.error(
        `Failed to fetch and save inventory for product ${productId} on date ${date}: ${error}`,
      );
    }
  }

  async syncInventoryForNextDays(days: number): Promise<void> {
    this.logger.log(`Syncing inventory for the next ${days} days`);
    const today: Date = new Date();

    for (const productId of this.productIds) {
      for (let i = 0; i < days; i++) {
        const date: Date = addDays(today, i);
        const formattedDate: string = format(date, 'yyyy-MM-dd');

        if (productId === 15 && date.getDay() !== 0) {
          continue; // skip if productId is 15 and its not Sunday
        }

        if (productId === 14 && ![1, 2, 3].includes(date.getDay())) {
          continue; // skip if productId is 14 and it not monday, tuesday, wednesday
        }

        await this.fetchAndSaveInventory(productId, formattedDate);
      }
    }
  }

  async syncForNextMonth(): Promise<void> {
    await this.syncInventoryForNextDays(30);
  }

  async syncForNextWeek(): Promise<void> {
    await this.syncInventoryForNextDays(7);
  }

  async syncForToday(): Promise<void> {
    await this.syncInventoryForNextDays(1);
  }
}
