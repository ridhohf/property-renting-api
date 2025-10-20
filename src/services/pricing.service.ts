import { prisma } from "../config/database";

export class PricingService {
  async calculatePrice(
    roomId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<number> {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        peakSeasonRates: true,
      },
    });

    if (!room) {
      throw new Error("Room not found");
    }

    let totalPrice = 0;
    const currentDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    while (currentDate < endDate) {
      let dailyPrice = Number(room.basePrice);

      // Check for peak season rates
      const peakRate = room.peakSeasonRates.find((rate) => {
        const rateStart = new Date(rate.startDate);
        const rateEnd = new Date(rate.endDate);
        return currentDate >= rateStart && currentDate <= rateEnd;
      });

      if (peakRate) {
        if (peakRate.adjustmentType === "PERCENTAGE") {
          dailyPrice += dailyPrice * (Number(peakRate.adjustmentValue) / 100);
        } else {
          dailyPrice += Number(peakRate.adjustmentValue);
        }
      }

      totalPrice += dailyPrice;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return Math.round(totalPrice * 100) / 100;
  }

  async getRoomPricesForMonth(roomId: string, year: number, month: number) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { peakSeasonRates: true },
    });

    if (!room) {
      throw new Error("Room not found");
    }

    const prices: { [key: string]: number } = {};
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];

      let dailyPrice = Number(room.basePrice);

      const peakRate = room.peakSeasonRates.find((rate) => {
        const rateStart = new Date(rate.startDate);
        const rateEnd = new Date(rate.endDate);
        return date >= rateStart && date <= rateEnd;
      });

      if (peakRate) {
        if (peakRate.adjustmentType === "PERCENTAGE") {
          dailyPrice += dailyPrice * (Number(peakRate.adjustmentValue) / 100);
        } else {
          dailyPrice += Number(peakRate.adjustmentValue);
        }
      }

      prices[dateStr] = Math.round(dailyPrice * 100) / 100;
    }

    return prices;
  }
}
