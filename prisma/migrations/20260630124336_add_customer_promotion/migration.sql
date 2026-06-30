-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "discountPercent" REAL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "daysOfWeek" TEXT NOT NULL,
    "menuItemIds" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "restaurantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Promotion_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "subtotal" REAL NOT NULL,
    "tax" REAL NOT NULL,
    "total" REAL NOT NULL,
    "notes" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
    "restaurantId" TEXT NOT NULL,
    "tableId" TEXT,
    "customerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("createdAt", "id", "notes", "orderNumber", "paymentStatus", "restaurantId", "status", "subtotal", "tableId", "tax", "total", "updatedAt") SELECT "createdAt", "id", "notes", "orderNumber", "paymentStatus", "restaurantId", "status", "subtotal", "tableId", "tax", "total", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE TABLE "new_Restaurant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "password" TEXT,
    "description" TEXT,
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "taxRate" REAL NOT NULL DEFAULT 0.08,
    "plan" TEXT NOT NULL DEFAULT 'pro',
    "latitude" REAL,
    "longitude" REAL,
    "locationRadius" REAL NOT NULL DEFAULT 100,
    "defaultLanguage" TEXT NOT NULL DEFAULT 'en',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Restaurant" ("address", "coverUrl", "createdAt", "currency", "description", "id", "latitude", "locationRadius", "logoUrl", "longitude", "name", "password", "phone", "plan", "slug", "taxRate", "updatedAt") SELECT "address", "coverUrl", "createdAt", "currency", "description", "id", "latitude", "locationRadius", "logoUrl", "longitude", "name", "password", "phone", "plan", "slug", "taxRate", "updatedAt" FROM "Restaurant";
DROP TABLE "Restaurant";
ALTER TABLE "new_Restaurant" RENAME TO "Restaurant";
CREATE UNIQUE INDEX "Restaurant_slug_key" ON "Restaurant"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");
