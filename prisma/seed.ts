import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:dev.db" });
const prisma = new PrismaClient({ adapter });

const rooms = [
  {
    name: "Promenade des Anglais",
    description: "Light-filled room with balcony overlooking the gardens. Steps from the famous 7km seafront boulevard and the Mediterranean.",
    monthlyPrice: 950,
  },
  {
    name: "Vieux-Nice",
    description: "Charming room in the old town style — warm tones, high ceilings. Surrounded by baroque architecture, narrow lanes, and vibrant markets.",
    monthlyPrice: 850,
  },
  {
    name: "Colline du Château",
    description: "Top-floor room with a private terrace offering panoramic views of the Baie des Anges and the city rooftops. The best view in the house.",
    monthlyPrice: 1050,
  },
  {
    name: "Cours Saleya",
    description: "Sunny room with garden access, named after Nice's legendary flower and food market. Ground floor, quiet, ideal for longer stays.",
    monthlyPrice: 780,
  },
  {
    name: "Mont Boron",
    description: "Peaceful room at the rear of the apartment with leafy views. Named after the forested hill that overlooks the Bay of Villefranche.",
    monthlyPrice: 820,
  },
];

async function main() {
  console.log("Resetting and seeding rooms...");

  // Clear existing rooms (bookings cascade)
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();

  for (const room of rooms) {
    const created = await prisma.room.create({ data: room });
    console.log(`  ✓ ${created.name} (€${created.monthlyPrice}/mo)`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
