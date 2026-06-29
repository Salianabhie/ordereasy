import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import path from "path";

const dbPath = path.join(__dirname, "..", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

const FOOD_IMAGES = {
  burger:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
  pizza:
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
  pasta:
    "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80",
  salad:
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  fries:
    "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80",
  drink:
    "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80",
  dessert:
    "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80",
  bread:
    "https://images.unsplash.com/photo-1573140247632-f8fd7493d5da?w=800&q=80",
  steak:
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
  soup:
    "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
};

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customizationOption.deleteMany();
  await prisma.customizationGroup.deleteMany();
  await prisma.upsellRule.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();
  await prisma.restaurant.deleteMany();

  const restaurant = await prisma.restaurant.create({
    data: {
      name: "Bella Vista",
      slug: "bella-vista",
      description: "Modern Italian cuisine with a contemporary twist",
      logoUrl:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&q=80",
      coverUrl:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
      address: "2847 Market Street, San Francisco, CA",
      phone: "+1 (415) 555-0192",
      currency: "USD",
      taxRate: 0.0875,
      plan: "pro",
    },
  });

  for (let i = 1; i <= 12; i++) {
    await prisma.table.create({
      data: {
        number: i,
        qrCode: `bella-vista-table-${i}`,
        capacity: i <= 4 ? 2 : i <= 8 ? 4 : 6,
        status: "available",
        restaurantId: restaurant.id,
      },
    });
  }

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Starters",
        slug: "starters",
        sortOrder: 0,
        restaurantId: restaurant.id,
        imageUrl: FOOD_IMAGES.soup,
      },
    }),
    prisma.category.create({
      data: {
        name: "Mains",
        slug: "mains",
        sortOrder: 1,
        restaurantId: restaurant.id,
        imageUrl: FOOD_IMAGES.steak,
      },
    }),
    prisma.category.create({
      data: {
        name: "Pizza",
        slug: "pizza",
        sortOrder: 2,
        restaurantId: restaurant.id,
        imageUrl: FOOD_IMAGES.pizza,
      },
    }),
    prisma.category.create({
      data: {
        name: "Burgers",
        slug: "burgers",
        sortOrder: 3,
        restaurantId: restaurant.id,
        imageUrl: FOOD_IMAGES.burger,
      },
    }),
    prisma.category.create({
      data: {
        name: "Sides",
        slug: "sides",
        sortOrder: 4,
        restaurantId: restaurant.id,
        imageUrl: FOOD_IMAGES.fries,
      },
    }),
    prisma.category.create({
      data: {
        name: "Drinks",
        slug: "drinks",
        sortOrder: 5,
        restaurantId: restaurant.id,
        imageUrl: FOOD_IMAGES.drink,
      },
    }),
    prisma.category.create({
      data: {
        name: "Desserts",
        slug: "desserts",
        sortOrder: 6,
        restaurantId: restaurant.id,
        imageUrl: FOOD_IMAGES.dessert,
      },
    }),
  ]);

  const [starters, mains, pizza, burgers, sides, drinks, desserts] = categories;

  const items = await Promise.all([
    prisma.menuItem.create({
      data: {
        name: "Truffle Arancini",
        description: "Crispy risotto balls with black truffle and parmesan",
        price: 14,
        imageUrl: FOOD_IMAGES.soup,
        isPopular: true,
        tags: "starter,italian",
        sortOrder: 0,
        categoryId: starters.id,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Burrata & Heirloom Tomato",
        description: "Fresh burrata with basil oil and aged balsamic",
        price: 16,
        imageUrl: FOOD_IMAGES.salad,
        tags: "starter,salad",
        sortOrder: 1,
        categoryId: starters.id,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Wagyu Ribeye",
        description: "12oz Australian wagyu with roasted garlic butter",
        price: 68,
        imageUrl: FOOD_IMAGES.steak,
        isPopular: true,
        prepTime: 25,
        tags: "main,steak",
        sortOrder: 0,
        categoryId: mains.id,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Lobster Linguine",
        description: "Fresh Maine lobster in saffron cream sauce",
        price: 42,
        imageUrl: FOOD_IMAGES.pasta,
        isPopular: true,
        tags: "main,pasta,seafood",
        sortOrder: 1,
        categoryId: mains.id,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Margherita Pizza",
        description: "San Marzano tomatoes, fresh mozzarella, basil",
        price: 22,
        imageUrl: FOOD_IMAGES.pizza,
        isPopular: true,
        tags: "pizza,main,italian",
        sortOrder: 0,
        categoryId: pizza.id,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Truffle Mushroom Pizza",
        description: "Wild mushrooms, truffle oil, fontina cheese",
        price: 28,
        imageUrl: FOOD_IMAGES.pizza,
        tags: "pizza,main",
        sortOrder: 1,
        categoryId: pizza.id,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Classic Smash Burger",
        description: "Double patty, aged cheddar, secret sauce, brioche bun",
        price: 19,
        imageUrl: FOOD_IMAGES.burger,
        isPopular: true,
        tags: "burger,main",
        sortOrder: 0,
        categoryId: burgers.id,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Truffle Burger",
        description: "Wagyu blend, truffle aioli, caramelized onions",
        price: 26,
        imageUrl: FOOD_IMAGES.burger,
        tags: "burger,main",
        sortOrder: 1,
        categoryId: burgers.id,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Truffle Fries",
        description: "Hand-cut fries with parmesan and truffle oil",
        price: 9,
        imageUrl: FOOD_IMAGES.fries,
        tags: "fries,side",
        sortOrder: 0,
        categoryId: sides.id,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Garlic Bread",
        description: "Wood-fired with herb butter and sea salt",
        price: 8,
        imageUrl: FOOD_IMAGES.bread,
        tags: "bread,side",
        sortOrder: 1,
        categoryId: sides.id,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Craft Lemonade",
        description: "House-made with fresh mint and ginger",
        price: 6,
        imageUrl: FOOD_IMAGES.drink,
        tags: "drink,beverage",
        sortOrder: 0,
        categoryId: drinks.id,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Sparkling Water",
        description: "San Pellegrino 750ml",
        price: 5,
        imageUrl: FOOD_IMAGES.drink,
        tags: "drink,beverage",
        sortOrder: 1,
        categoryId: drinks.id,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "House Red Wine",
        description: "Glass of Chianti Classico",
        price: 12,
        imageUrl: FOOD_IMAGES.drink,
        tags: "drink,beverage,wine",
        sortOrder: 2,
        categoryId: drinks.id,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Tiramisu",
        description: "Classic Italian with espresso-soaked ladyfingers",
        price: 12,
        imageUrl: FOOD_IMAGES.dessert,
        isPopular: true,
        tags: "dessert,sweet",
        sortOrder: 0,
        categoryId: desserts.id,
        restaurantId: restaurant.id,
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Chocolate Lava Cake",
        description: "Warm dark chocolate with vanilla gelato",
        price: 14,
        imageUrl: FOOD_IMAGES.dessert,
        tags: "dessert,sweet",
        sortOrder: 1,
        categoryId: desserts.id,
        restaurantId: restaurant.id,
      },
    }),
  ]);

  const [
    ,
    ,
    ,
    ,
    margherita,
    ,
    classicBurger,
    ,
    truffleFries,
    garlicBread,
    ,
    ,
    ,
    tiramisu,
  ] = items;

  await prisma.customizationGroup.createMany({
    data: [
      {
        id: "cg-burger-doneness",
        name: "Doneness",
        required: true,
        maxSelect: 1,
        menuItemId: classicBurger.id,
      },
      {
        id: "cg-burger-extras",
        name: "Add Extras",
        required: false,
        maxSelect: 3,
        menuItemId: classicBurger.id,
      },
      {
        id: "cg-pizza-size",
        name: "Size",
        required: true,
        maxSelect: 1,
        menuItemId: margherita.id,
      },
    ],
  });

  await prisma.customizationOption.createMany({
    data: [
      { name: "Medium Rare", price: 0, groupId: "cg-burger-doneness" },
      { name: "Medium", price: 0, groupId: "cg-burger-doneness" },
      { name: "Well Done", price: 0, groupId: "cg-burger-doneness" },
      { name: "Extra Cheese", price: 2, groupId: "cg-burger-extras" },
      { name: "Bacon", price: 3, groupId: "cg-burger-extras" },
      { name: "Avocado", price: 2.5, groupId: "cg-burger-extras" },
      { name: "Regular (10\")", price: 0, groupId: "cg-pizza-size" },
      { name: "Large (14\")", price: 6, groupId: "cg-pizza-size" },
    ],
  });

  await prisma.upsellRule.createMany({
    data: [
      {
        triggerItemId: classicBurger.id,
        suggestedItemId: truffleFries.id,
        message: "Complete your meal with truffle fries",
      },
      {
        triggerItemId: classicBurger.id,
        suggestedItemId: items[10].id,
        message: "Add a refreshing craft lemonade",
      },
      {
        triggerItemId: margherita.id,
        suggestedItemId: garlicBread.id,
        message: "Garlic bread pairs perfectly with pizza",
      },
      {
        triggerItemId: margherita.id,
        suggestedItemId: tiramisu.id,
        message: "Finish with classic tiramisu",
      },
    ],
  });

  const table5 = await prisma.table.findFirst({
    where: { restaurantId: restaurant.id, number: 5 },
  });

  const sampleOrders = [
    {
      orderNumber: 1042,
      status: "preparing",
      subtotal: 47,
      tax: 4.11,
      total: 51.11,
      tableId: table5!.id,
      items: [
        { menuItemId: margherita.id, quantity: 1, unitPrice: 22 },
        { menuItemId: garlicBread.id, quantity: 1, unitPrice: 8 },
        { menuItemId: items[10].id, quantity: 2, unitPrice: 6 },
      ],
    },
    {
      orderNumber: 1043,
      status: "pending",
      subtotal: 68,
      tax: 5.95,
      total: 73.95,
      tableId: table5!.id,
      items: [{ menuItemId: items[2].id, quantity: 1, unitPrice: 68 }],
    },
  ];

  for (const orderData of sampleOrders) {
    const { items: orderItems, ...order } = orderData;
    await prisma.order.create({
      data: {
        ...order,
        restaurantId: restaurant.id,
        items: {
          create: orderItems.map((item) => ({
            ...item,
            customizations: "[]",
          })),
        },
      },
    });
  }

  console.log("✅ Seeded Bella Vista restaurant with menu, tables, and orders");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
