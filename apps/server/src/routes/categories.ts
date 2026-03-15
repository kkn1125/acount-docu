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

/** POST / body: { name: string, type: 'INCOME'|'EXPENSE' }. Create category for demo user. */
router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = await getDemoUserId();
    if (!userId) {
      return res.status(404).json({ error: "Demo user not found" });
    }

    const { name, type } = req.body as { name?: string; type?: string };
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "name is required and must be non-empty" });
    }
    if (!type || !Object.values(TransactionType).includes(type as TransactionType)) {
      return res.status(400).json({ error: "type must be INCOME or EXPENSE" });
    }
    const txType = type as TransactionType;
    if (txType === TransactionType.TRANSFER) {
      return res.status(400).json({ error: "type must be INCOME or EXPENSE" });
    }

    const category = await prisma.category.create({
      data: {
        userId,
        name: name.trim(),
        type: txType,
      },
    });

    res.status(201).json(category);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** PUT /:id body: { name?: string }. Update category; must be owned by demo user. */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const userId = await getDemoUserId();
    if (!userId) {
      return res.status(404).json({ error: "Demo user not found" });
    }

    const { id } = req.params as { id: string };
    if (!id) {
      return res.status(400).json({ error: "Category id is required" });
    }

    const existing = await prisma.category.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Category not found" });
    }

    const { name } = req.body as { name?: string };
    const data: { name?: string } = {};
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ error: "name must be non-empty when provided" });
      }
      data.name = name.trim();
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    res.json(category);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** DELETE /:id. Delete category; 409 if used by any transaction or budget. */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = await getDemoUserId();
    if (!userId) {
      return res.status(404).json({ error: "Demo user not found" });
    }

    const { id } = req.params as { id: string };
    if (!id) {
      return res.status(400).json({ error: "Category id is required" });
    }

    const existing = await prisma.category.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Category not found" });
    }

    const [txCount, budgetCount] = await Promise.all([
      prisma.transaction.count({ where: { categoryId: id } }),
      prisma.budget.count({ where: { categoryId: id } }),
    ]);

    if (txCount > 0 || budgetCount > 0) {
      return res.status(409).json({
        error: "사용 중인 카테고리입니다",
        message: "거래 또는 예산에서 사용 중인 카테고리는 삭제할 수 없습니다.",
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
