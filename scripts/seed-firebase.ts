/**
 * Seed Firestore with Bella Vista demo restaurant.
 * Requires Firebase Admin credentials in .env
 *
 * Usage: npm run firebase:seed
 */
import "dotenv/config";
import { getAdminDb, restaurantRef } from "../src/lib/firebase/admin";
import { isFirebaseAdminConfigured } from "../src/lib/firebase/config";

const SLUG = "bella-vista";

const FOOD_IMAGES = {
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
  pasta: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80",
  salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  fries: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80",
  drink: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80",
  dessert: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80",
  bread: "https://images.unsplash.com/photo-1573140247632-f8fd7493d5da?w=800&q=80",
  steak: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
  soup: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
};

async function main() {
  if (!isFirebaseAdminConfigured()) {
    console.error("❌ Firebase Admin not configured. Copy .env.example → .env and fill in credentials.");
    process.exit(1);
  }

  const db = getAdminDb();
  const ref = restaurantRef(SLUG);

  await ref.set({
    name: "Bella Vista",
    slug: SLUG,
    description: "Modern Italian cuisine with a contemporary twist",
    logoUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&q=80",
    coverUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
    address: "2847 Market Street, San Francisco, CA",
    phone: "+1 (415) 555-0192",
    currency: "USD",
    taxRate: 0.0875,
    plan: "pro",
  });

  const categories = [
    { id: "starters", name: "Starters", slug: "starters", sortOrder: 0, imageUrl: FOOD_IMAGES.soup },
    { id: "mains", name: "Mains", slug: "mains", sortOrder: 1, imageUrl: FOOD_IMAGES.steak },
    { id: "pizza", name: "Pizza", slug: "pizza", sortOrder: 2, imageUrl: FOOD_IMAGES.pizza },
    { id: "burgers", name: "Burgers", slug: "burgers", sortOrder: 3, imageUrl: FOOD_IMAGES.burger },
    { id: "sides", name: "Sides", slug: "sides", sortOrder: 4, imageUrl: FOOD_IMAGES.fries },
    { id: "drinks", name: "Drinks", slug: "drinks", sortOrder: 5, imageUrl: FOOD_IMAGES.drink },
    { id: "desserts", name: "Desserts", slug: "desserts", sortOrder: 6, imageUrl: FOOD_IMAGES.dessert },
  ];

  for (const cat of categories) {
    await ref.collection("categories").doc(cat.id).set(cat);
  }

  const menuItems = [
    { id: "arancini", name: "Truffle Arancini", description: "Crispy risotto balls with black truffle", price: 14, imageUrl: FOOD_IMAGES.soup, isPopular: true, tags: "starter,italian", sortOrder: 0, categoryId: "starters" },
    { id: "burrata", name: "Burrata & Heirloom Tomato", description: "Fresh burrata with basil oil", price: 16, imageUrl: FOOD_IMAGES.salad, tags: "starter,salad", sortOrder: 1, categoryId: "starters" },
    { id: "wagyu", name: "Wagyu Ribeye", description: "12oz Australian wagyu", price: 68, imageUrl: FOOD_IMAGES.steak, isPopular: true, tags: "main,steak", sortOrder: 0, categoryId: "mains" },
    { id: "lobster-pasta", name: "Lobster Linguine", description: "Maine lobster in saffron cream", price: 42, imageUrl: FOOD_IMAGES.pasta, isPopular: true, tags: "main,pasta", sortOrder: 1, categoryId: "mains" },
    { id: "margherita", name: "Margherita Pizza", description: "San Marzano tomatoes, mozzarella", price: 22, imageUrl: FOOD_IMAGES.pizza, isPopular: true, tags: "pizza,main", sortOrder: 0, categoryId: "pizza" },
    { id: "truffle-pizza", name: "Truffle Mushroom Pizza", description: "Wild mushrooms, truffle oil", price: 28, imageUrl: FOOD_IMAGES.pizza, tags: "pizza,main", sortOrder: 1, categoryId: "pizza" },
    { id: "smash-burger", name: "Classic Smash Burger", description: "Double patty, aged cheddar", price: 19, imageUrl: FOOD_IMAGES.burger, isPopular: true, tags: "burger,main", sortOrder: 0, categoryId: "burgers" },
    { id: "truffle-burger", name: "Truffle Burger", description: "Wagyu blend, truffle aioli", price: 26, imageUrl: FOOD_IMAGES.burger, tags: "burger,main", sortOrder: 1, categoryId: "burgers" },
    { id: "truffle-fries", name: "Truffle Fries", description: "Hand-cut with parmesan", price: 9, imageUrl: FOOD_IMAGES.fries, tags: "fries,side", sortOrder: 0, categoryId: "sides" },
    { id: "garlic-bread", name: "Garlic Bread", description: "Wood-fired with herb butter", price: 8, imageUrl: FOOD_IMAGES.bread, tags: "bread,side", sortOrder: 1, categoryId: "sides" },
    { id: "lemonade", name: "Craft Lemonade", description: "Fresh mint and ginger", price: 6, imageUrl: FOOD_IMAGES.drink, tags: "drink,beverage", sortOrder: 0, categoryId: "drinks" },
    { id: "sparkling", name: "Sparkling Water", description: "San Pellegrino 750ml", price: 5, imageUrl: FOOD_IMAGES.drink, tags: "drink,beverage", sortOrder: 1, categoryId: "drinks" },
    { id: "tiramisu", name: "Tiramisu", description: "Classic Italian dessert", price: 12, imageUrl: FOOD_IMAGES.dessert, isPopular: true, tags: "dessert,sweet", sortOrder: 0, categoryId: "desserts" },
  ];

  for (const item of menuItems) {
    await ref.collection("menuItems").doc(item.id).set({ ...item, isAvailable: true, prepTime: 15 });
  }

  for (let i = 1; i <= 12; i++) {
    await ref.collection("tables").doc(`table-${i}`).set({
      number: i,
      qrCode: `${SLUG}-table-${i}`,
      capacity: i <= 4 ? 2 : i <= 8 ? 4 : 6,
      status: "available",
    });
  }

  await ref.collection("upsellRules").doc("burger-fries").set({
    triggerItemId: "smash-burger",
    suggestedItemId: "truffle-fries",
    message: "Complete your meal with truffle fries",
    discount: 0,
  });
  await ref.collection("upsellRules").doc("pizza-bread").set({
    triggerItemId: "margherita",
    suggestedItemId: "garlic-bread",
    message: "Garlic bread pairs perfectly with pizza",
    discount: 0,
  });

  const now = new Date();
  await ref.collection("orders").doc("sample-1042").set({
    orderNumber: 1042,
    status: "preparing",
    subtotal: 47,
    tax: 4.11,
    total: 51.11,
    paymentStatus: "unpaid",
    tableId: "table-5",
    tableNumber: 5,
    createdAt: now,
    updatedAt: now,
    items: [
      { menuItemId: "margherita", menuItemName: "Margherita Pizza", quantity: 1, unitPrice: 22 },
      { menuItemId: "garlic-bread", menuItemName: "Garlic Bread", quantity: 1, unitPrice: 8 },
      { menuItemId: "lemonade", menuItemName: "Craft Lemonade", quantity: 2, unitPrice: 6 },
    ],
  });

  await ref.collection("meta").doc("counters").set({ lastOrderNumber: 1043 });

  console.log("✅ Seeded Firestore with Bella Vista demo data");
  console.log(`   Collection: restaurants/${SLUG}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
