import { Router, Request, Response } from "express";
import { prisma } from "../db/prismaClient";

const DEMO_EMAIL = "demo@local";
const router = Router();

async function getDemoUser() {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });
  return user;
}

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

/** GET /api/user — 현재 데모 유저 정보 반환 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const user = await getDemoUser();
    if (!user) {
      return res.status(404).json({ error: "Demo user not found" });
    }
    return res.json(toUserPayload(user));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/** PATCH /api/user — name, currency, locale, timezone 수정 */
router.patch("/", async (req: Request, res: Response) => {
  try {
    const user = await getDemoUser();
    if (!user) {
      return res.status(404).json({ error: "Demo user not found" });
    }

    const { name, currency, locale, timezone } = req.body as {
      name?: string | null;
      currency?: string;
      locale?: string;
      timezone?: string;
    };

    const data: {
      name?: string | null;
      currency?: string;
      locale?: string;
      timezone?: string;
    } = {};

    if (name !== undefined) {
      const trimmed = name?.trim() ?? "";
      data.name = trimmed || null;
    }
    if (currency !== undefined) {
      data.currency = String(currency);
    }
    if (locale !== undefined) {
      data.locale = String(locale);
    }
    if (timezone !== undefined) {
      data.timezone = String(timezone);
    }

    if (Object.keys(data).length === 0) {
      return res.json(toUserPayload(user));
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
    });

    return res.json(toUserPayload(updated));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

