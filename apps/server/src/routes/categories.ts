import { Router, Request, Response } from "express";
import { TransactionType } from "../generated/prisma";
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

/** GET /?type=INCOME|EXPENSE (optional). Returns categories for demo user. */
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = await getDemoUserId();
    if (!userId) {
      return res.status(404).json({ error: "Demo user not found" });
    }

    const type = req.query.type as string | undefined;
    const where: { userId: string; type?: TransactionType } = { userId };
    if (type && Object.values(TransactionType).includes(type as TransactionType)) {
      where.type = type as TransactionType;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    res.json(categories);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
