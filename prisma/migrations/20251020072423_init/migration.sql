-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'TENANT');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "profilePicture" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpiry" TIMESTAMP(3),
    "googleId" TEXT,
    "facebookId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "images" TEXT[],
    "tenantId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "images" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_availability" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peak_season_rates" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "adjustmentType" TEXT NOT NULL,
    "adjustmentValue" DECIMAL(10,2) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "peak_season_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "checkInDate" DATE NOT NULL,
    "checkOutDate" DATE NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "guests" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'WAITING_PAYMENT',
    "paymentProof" TEXT,
    "paymentProofUploadedAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "confirmedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT NOT NULL,
    "reply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "users_facebookId_key" ON "users"("facebookId");

-- CreateIndex
CREATE UNIQUE INDEX "property_categories_name_key" ON "property_categories"("name");

-- CreateIndex
CREATE INDEX "properties_city_isActive_idx" ON "properties"("city", "isActive");

-- CreateIndex
CREATE INDEX "properties_tenantId_idx" ON "properties"("tenantId");

-- CreateIndex
CREATE INDEX "rooms_propertyId_idx" ON "rooms"("propertyId");

-- CreateIndex
CREATE INDEX "room_availability_roomId_date_idx" ON "room_availability"("roomId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "room_availability_roomId_date_key" ON "room_availability"("roomId", "date");

-- CreateIndex
CREATE INDEX "peak_season_rates_roomId_startDate_endDate_idx" ON "peak_season_rates"("roomId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "bookings_userId_idx" ON "bookings"("userId");

-- CreateIndex
CREATE INDEX "bookings_roomId_idx" ON "bookings"("roomId");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_bookingId_key" ON "payments"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_bookingId_key" ON "reviews"("bookingId");

-- CreateIndex
CREATE INDEX "reviews_propertyId_idx" ON "reviews"("propertyId");

-- CreateIndex
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "property_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_availability" ADD CONSTRAINT "room_availability_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peak_season_rates" ADD CONSTRAINT "peak_season_rates_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
