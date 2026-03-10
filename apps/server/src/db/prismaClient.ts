import "dotenv/config";
import { PrismaClient } from "../generated/prisma";

const isDev = process.env.NODE_ENV !== "production";

export const prisma = new PrismaClient(
  isDev
    ? {
        log: ["query", "info", "warn", "error"],
      }
    : undefined
);
