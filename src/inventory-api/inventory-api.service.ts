import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { format, addMonths } from 'date-fns';

export interface Price {
  finalPrice: number;
  originalPrice: number;
  currencyCode: string;
}

@Injectable()
export class InventoryApiService {
  private readonly logger = new Logger(InventoryApiService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSlots(id: number, date: string) {
    this.logger.log(`Getting slots for ${id} on date ${date}`);

    const inventory = await this.prisma.inventory.findUnique({
      where: {
        productId_date: {
          productId: id,
          date: new Date(date),
        },
      },
      include: {
        slots: {
          include: {
            paxAvailabilities: true,
          },
        },
      },
    });

    if (!inventory || inventory.slots.length === 0) {
      throw new NotFoundException(
        `No slots found for experience ${id} on date ${date}`,
      );
    }

    return inventory.slots.map((slot) => {
      const lowestPrice = slot.paxAvailabilities.reduce(
        (min, pax) => (pax.finalPrice < min.finalPrice ? pax : min),
        slot.paxAvailabilities[0],
      );

      return {
        startTime: slot.startTime,
        startDate: format(inventory.date, 'yyyy-MM-dd'),
        price: {
          finalPrice: lowestPrice.finalPrice,
          originalPrice: lowestPrice.originalPrice,
          currencyCode: lowestPrice.currencyCode,
        },
        remaining: slot.remaining,
        paxAvailability: slot.paxAvailabilities.map((pax) => ({
          type: pax.type,
          name: pax.name,
          description: pax.description,
          price: {
            finalPrice: pax.finalPrice,
            originalPrice: pax.originalPrice,
            currencyCode: pax.currencyCode,
          },
          min: pax.min,
          max: pax.max,
          remaining: pax.remaining,
        })),
      };
    });
  }

  async getAvailableDates(id: number) {
    this.logger.log(`Getting available dates for ${id}`);

    const today = new Date();
    const twoMonthsLater = addMonths(today, 2);

    const inventories = await this.prisma.inventory.findMany({
      where: {
        productId: id,
        date: {
          gte: today,
          lte: twoMonthsLater,
        },
      },
      include: {
        slots: {
          include: {
            paxAvailabilities: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    if (!inventories || inventories.length === 0) {
      return { dates: [] };
    }

    const dates = inventories.map((inventory) => {
      let lowestPrice: Price | null = null;

      for (const slot of inventory.slots) {
        for (const pax of slot.paxAvailabilities) {
          if (!lowestPrice || pax.finalPrice < lowestPrice.finalPrice) {
            lowestPrice = {
              finalPrice: pax.finalPrice,
              originalPrice: pax.originalPrice,
              currencyCode: pax.currencyCode,
            };
          }
        }
      }

      return {
        date: format(inventory.date, 'yyyy-MM-dd'),
        price: lowestPrice || {
          finalPrice: 0,
          originalPrice: 0,
          currencyCode: 'SGD',
        },
      };
    });

    return { dates };
  }
}
