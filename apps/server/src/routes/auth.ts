import { Router, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../db/prismaClient";
import { signAccessToken } from "../auth/jwt";

const router = Router();

function toUserPayload(user: {
  id: string;
  email: string;
  name: string | null;
  currency: string;
  locale: string;
  timezone: string;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    currency: user.currency,
    locale: user.locale,
    timezone: user.timezone,
  };
}

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body as {
      email?: string;
      password?: string;
      name?: string | null;
    };

    const trimmedEmail = email?.trim().toLowerCase() ?? "";
    if (!trimmedEmail) {
      return res.status(400).json({ error: "email is required" });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "password must be at least 6 characters" });
    }

    const existing = await prisma.user.findUnique({
      where: { email: trimmedEmail },
      select: { id: true },
    });

    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: trimmedEmail,
        name: name?.trim() || null,
        passwordHash,
      },
    });

    const token = signAccessToken({ userId: user.id });

    return res.status(201).json({
      token,
      user: toUserPayload(user),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    const trimmedEmail = email?.trim().toLowerCase() ?? "";
    if (!trimmedEmail || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signAccessToken({ userId: user.id });

    return res.json({
      token,
      user: toUserPayload(user),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

