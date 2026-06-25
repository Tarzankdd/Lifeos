import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function normalizeSupabaseUrl(connectionString: string) {
  try {
    const url = new URL(connectionString);
    if (url.hostname.includes("supabase.com") || url.hostname.includes("pooler.supabase.com")) {
      url.searchParams.set("sslmode", "no-verify");
    }
    return url.toString();
  } catch {
    return connectionString;
  }
}

const connectionString = normalizeSupabaseUrl(
  process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    "postgresql://lifeos:lifeos@localhost:5432/lifeos?schema=public",
);

const adapter = new PrismaPg({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
