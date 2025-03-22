-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slot" (
    "id" SERIAL NOT NULL,
    "inventoryId" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "providerSlotId" TEXT NOT NULL,
    "remaining" INTEGER NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "variantId" INTEGER NOT NULL,

    CONSTRAINT "Slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaxAvailability" (
    "id" SERIAL NOT NULL,
    "slotId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "min" INTEGER,
    "max" INTEGER,
    "remaining" INTEGER NOT NULL,
    "finalPrice" DOUBLE PRECISION NOT NULL,
    "originalPrice" DOUBLE PRECISION NOT NULL,
    "currencyCode" TEXT NOT NULL,

    CONSTRAINT "PaxAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_productId_date_key" ON "Inventory"("productId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Slot_inventoryId_startTime_key" ON "Slot"("inventoryId", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "PaxAvailability_slotId_type_key" ON "PaxAvailability"("slotId", "type");

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaxAvailability" ADD CONSTRAINT "PaxAvailability_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "Slot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
