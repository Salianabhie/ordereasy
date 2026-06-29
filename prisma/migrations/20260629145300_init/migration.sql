-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "taxRate" REAL NOT NULL DEFAULT 0.08,
    "plan" TEXT NOT NULL DEFAULT 'pro',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Table" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "qrCode" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 4,
    "status" TEXT NOT NULL DEFAULT 'available',
    "restaurantId" TEXT NOT NULL,
    CONSTRAINT "Table_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "restaurantId" TEXT NOT NULL,
    CONSTRAINT "Category_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "imageUrl" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "prepTime" INTEGER NOT NULL DEFAULT 15,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT NOT NULL DEFAULT '',
    "categoryId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MenuItem_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomizationGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "maxSelect" INTEGER NOT NULL DEFAULT 1,
    "menuItemId" TEXT NOT NULL,
    CONSTRAINT "CustomizationGroup_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomizationOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL DEFAULT 0,
    "groupId" TEXT NOT NULL,
    CONSTRAINT "CustomizationOption_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CustomizationGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "customizations" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "orderId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UpsellRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "triggerItemId" TEXT NOT NULL,
    "suggestedItemId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "UpsellRule_triggerItemId_fkey" FOREIGN KEY ("triggerItemId") REFERENCES "MenuItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UpsellRule_suggestedItemId_fkey" FOREIGN KEY ("suggestedItemId") REFERENCES "MenuItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_slug_key" ON "Restaurant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Table_qrCode_key" ON "Table"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "Table_restaurantId_number_key" ON "Table"("restaurantId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Category_restaurantId_slug_key" ON "Category"("restaurantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "UpsellRule_triggerItemId_suggestedItemId_key" ON "UpsellRule"("triggerItemId", "suggestedItemId");
