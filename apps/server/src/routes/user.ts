import { Router, Request, Response } from "express";
import { prisma } from "../db/prismaClient";

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

/** GET /api/user — 현재 로그인 유저 정보 반환 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
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
    const userId = req.userId!;

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

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return res.json(toUserPayload(updated));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

