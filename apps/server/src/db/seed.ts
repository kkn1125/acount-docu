import { AccountType, TransactionType } from "../generated/prisma/client";
import { prisma } from "./prismaClient";

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

const DEFAULT_INCOME_CATEGORIES = [
  "월급",
  "이체",
  "부수입",
  "사업수입",
  "이자/배당",
  "용돈",
  "기타수입",
];
const DEFAULT_EXPENSE_CATEGORIES = [
  "식비",
  "구독/정기",
  "이체",
  "간식",
  "모임",
  "교통비",
  "주거비",
  "통신비",
  "쇼핑",
  "뷰티/미용",
  "의료",
  "건강/운동",
  "교육",
  "문화/취미",
  "여행/숙박",
  "경조사/선물",
  "기타지출",
];

const DEFAULT_ACCOUNTS: {
  name: string;
  type: AccountType;
  isDefault: boolean;
}[] = [
  { name: "현금", type: AccountType.CASH, isDefault: true },
  { name: "은행", type: AccountType.BANK, isDefault: false },
  { name: "카드", type: AccountType.CREDIT_CARD, isDefault: false },
];

export async function ensureDemoData() {
  const user = await ensureDemoUser();

  const existingAccounts = await prisma.account.findMany({
    where: { userId: user.id },
    select: { name: true },
  });
  const existingAccountNames = new Set(existingAccounts.map((a) => a.name));

  for (let i = 0; i < DEFAULT_ACCOUNTS.length; i++) {
    const { name, type, isDefault } = DEFAULT_ACCOUNTS[i];
    if (existingAccountNames.has(name)) continue;
    await prisma.account.create({
      data: {
        userId: user.id,
        name,
        type,
        isDefault,
        sortOrder: i,
      },
    });
  }

  const existingCategories = await prisma.category.findMany({
    where: { userId: user.id },
    select: { name: true, type: true },
  });
  const existingSet = new Set(
    existingCategories.map(
      (c: { name: string; type: TransactionType }) => `${c.type}:${c.name}`
    )
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

  const defaultAccount = await prisma.account.findFirst({
    where: { userId: user.id, name: "현금" },
  });
  return { user, account: defaultAccount ?? undefined };
}
