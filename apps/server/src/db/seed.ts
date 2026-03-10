import { AccountType, TransactionType } from "../generated/prisma";
import { prisma } from "./prisma";

const DEMO_EMAIL = "demo@local";
const DEMO_NAME = "Demo";

export async function ensureDemoUser() {
  let user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: DEMO_EMAIL,
        name: DEMO_NAME,
      },
    });
  }
  return user;
}

const DEFAULT_INCOME_CATEGORIES = ["월급", "부수입", "기타수입"];
const DEFAULT_EXPENSE_CATEGORIES = [
  "식비",
  "교통비",
  "주거비",
  "통신비",
  "쇼핑",
  "의료",
  "교육",
  "기타지출",
];

export async function ensureDemoData() {
  const user = await ensureDemoUser();

  let account = await prisma.account.findFirst({
    where: { userId: user.id, name: "현금" },
  });
  if (!account) {
    account = await prisma.account.create({
      data: {
        userId: user.id,
        name: "현금",
        type: AccountType.CASH,
        isDefault: true,
      },
    });
  }

  const existingCategories = await prisma.category.findMany({
    where: { userId: user.id },
    select: { name: true, type: true },
  });
  const existingSet = new Set(
    existingCategories.map((c) => `${c.type}:${c.name}`)
  );

  for (const name of DEFAULT_INCOME_CATEGORIES) {
    if (existingSet.has(`${TransactionType.INCOME}:${name}`)) continue;
    await prisma.category.create({
      data: { userId: user.id, name, type: TransactionType.INCOME },
    });
  }
  for (const name of DEFAULT_EXPENSE_CATEGORIES) {
    if (existingSet.has(`${TransactionType.EXPENSE}:${name}`)) continue;
    await prisma.category.create({
      data: { userId: user.id, name, type: TransactionType.EXPENSE },
    });
  }

  return { user, account };
}
