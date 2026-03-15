import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}
// MariaDB 드라이버: RSA 공개키 미지원 서버 접속 시 필요
if (!connectionString.includes("allowPublicKeyRetrieval")) {
  const sep = connectionString.includes("?") ? "&" : "?";
  connectionString += `${sep}allowPublicKeyRetrieval=true`;
}

const adapter = new PrismaMariaDb(connectionString);
const isDev = process.env.NODE_ENV !== "production";

export const prisma = new PrismaClient({
  adapter,
  ...(isDev ? { log: ["query", "info", "warn", "error"] as const } : {}),
});
