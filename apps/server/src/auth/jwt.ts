import jwt from "jsonwebtoken";

const DEFAULT_JWT_SECRET = "dev-jwt-secret-change-me";

const JWT_EXPIRES_IN = "7d";

export interface JwtPayload {
  userId: string;
}

export function getJwtSecret(): string {
  return process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, getJwtSecret());
  if (typeof decoded !== "object" || decoded == null || !("userId" in decoded)) {
    throw new Error("Invalid token payload");
  }
  return decoded as JwtPayload;
}

