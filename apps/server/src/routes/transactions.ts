import { Router, Request, Response } from "express";
import { TransactionType } from "../generated/prisma/client";
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

/** GET /?month=YYYY-MM (default: current month). Returns list with category and account. */
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = await getDemoUserId();
    if (!userId) {
      return res.status(404).json({ error: "Demo user not found" });
    }

    let monthStr = req.query.month as string | undefined;
    if (!monthStr) {
      const now = new Date();
      monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    }
    const [y, m] = monthStr.split("-").map(Number);
    if (!y || !m || m < 1 || m > 12) {
      return res.status(400).json({ error: "Invalid month; use YYYY-MM" });
    }
    const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      include: {
        category: true,
        account: true,
      },
      orderBy: { date: "desc" },
    });

    res.json(transactions);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** POST / body: type, amount, date, categoryId, accountId, memo?, isFixed?, scheduledAt?, labels? */
router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = await getDemoUserId();
    if (!userId) {
      return res.status(404).json({ error: "Demo user not found" });
    }

    const {
      type,
      amount,
      date,
      categoryId,
      accountId,
      memo,
      isFixed,
      scheduledAt,
      labels,
    } = req.body;

    if (
      type == null ||
      amount == null ||
      date == null ||
      categoryId == null ||
      accountId == null
    ) {
      return res
        .status(400)
        .json({ error: "Missing required fields: type, amount, date, categoryId, accountId" });
    }
    if (!Object.values(TransactionType).includes(type)) {
      return res.status(400).json({ error: "Invalid type" });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId,
        categoryId,
        type,
        amount: Number(amount),
        date: new Date(date),
        memo: memo ?? undefined,
        isFixed: Boolean(isFixed),
        scheduledAt: scheduledAt != null ? new Date(scheduledAt) : undefined,
        labels: labels != null ? labels : undefined,
      },
      include: {
        category: true,
        account: true,
      },
    });

    res.status(201).json(transaction);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** PUT /:id body: type?, amount?, date?, categoryId?, accountId?, memo?, isFixed?, scheduledAt?, labels? */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const userId = await getDemoUserId();
    if (!userId) {
      return res.status(404).json({ error: "Demo user not found" });
    }

    const { id } = req.params as { id: string };
    if (!id) {
      return res.status(400).json({ error: "Transaction id is required" });
    }

    const existing = await prisma.transaction.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const {
      type,
      amount,
      date,
      categoryId,
      accountId,
      memo,
      isFixed,
      scheduledAt,
      labels,
    } = req.body;

    if (type != null && !Object.values(TransactionType).includes(type)) {
      return res.status(400).json({ error: "Invalid type" });
    }

    const data: Record<string, unknown> = {};

    if (type != null) {
      data.type = type;
    }
    if (amount != null) {
      data.amount = Number(amount);
    }
    if (date != null) {
      data.date = new Date(date);
    }
    if (categoryId != null) {
      data.categoryId = categoryId;
    }
    if (accountId != null) {
      data.accountId = accountId;
    }
    if (memo !== undefined) {
      data.memo = memo ?? null;
    }
    if (isFixed != null) {
      data.isFixed = Boolean(isFixed);
    }
    if (scheduledAt !== undefined) {
      data.scheduledAt = scheduledAt != null ? new Date(scheduledAt) : null;
    }
    if (labels !== undefined) {
      data.labels = labels != null ? labels : null;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data,
      include: {
        category: true,
        account: true,
      },
    });

    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** DELETE /:id - delete transaction owned by demo user */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = await getDemoUserId();
    if (!userId) {
      return res.status(404).json({ error: "Demo user not found" });
    }

    const { id } = req.params as { id: string };
    if (!id) {
      return res.status(400).json({ error: "Transaction id is required" });
    }

    const existing = await prisma.transaction.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
