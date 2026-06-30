-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Restaurant" ("address", "coverUrl", "createdAt", "currency", "description", "id", "logoUrl", "name", "password", "phone", "plan", "slug", "taxRate", "updatedAt") SELECT "address", "coverUrl", "createdAt", "currency", "description", "id", "logoUrl", "name", "password", "phone", "plan", "slug", "taxRate", "updatedAt" FROM "Restaurant";
DROP TABLE "Restaurant";
ALTER TABLE "new_Restaurant" RENAME TO "Restaurant";
CREATE UNIQUE INDEX "Restaurant_slug_key" ON "Restaurant"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
