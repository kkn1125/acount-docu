import { Router, Request, Response } from "express";
import { prisma } from "../db/prismaClient";

const DEMO_EMAIL = "demo@local";
const router = Router();

async function getDemoUserId(): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    select: { id: true },
  });
  return user?.id ?? null;
}

/** GET / Returns accounts for demo user. */
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = await getDemoUserId();
    if (!userId) {
      return res.status(404).json({ error: "Demo user not found" });
    }

    const accounts = await prisma.account.findMany({
      where: { userId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    res.json(accounts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
