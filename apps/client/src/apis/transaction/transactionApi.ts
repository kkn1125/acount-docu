import { API_BASE_URL } from '../../common/config/apiConfig';
import type { TransactionItem, TransactionType } from '../../types/transaction';

export interface GetTransactionListParams {
  /** YYYY-MM 형식 */
  month: string;
}

export type GetTransactionListResponse = TransactionItem[];

export interface CreateTransactionRequest {
  type: TransactionType;
  amount: number;
  date: string;
  categoryId: string;
  accountId: string;
  memo?: string;
  isFixed?: boolean;
  scheduledAt?: string | null;
  labelIds?: string[];
}

export type CreateTransactionResponse = TransactionItem;

export interface UpdateTransactionRequest
  extends Partial<Omit<CreateTransactionRequest, 'type' | 'amount' | 'date'>> {
  type?: TransactionType;
  amount?: number;
  date?: string;
}

export type UpdateTransactionResponse = TransactionItem;

export const getTransactionList = async (
  params: GetTransactionListParams,
): Promise<GetTransactionListResponse> => {
  const url = new URL('/api/transactions', API_BASE_URL);
  url.searchParams.set('month', params.month);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error('거래 목록을 불러오지 못했습니다.');
  }

  const data = await res.json();

  return data.map((item: any) => ({
    id: item.id,
    type: mapServerTransactionType(item.type),
    amount: Number(item.amount),
    date: item.date,
    scheduledAt: item.scheduledAt ?? undefined,
    isFixed: Boolean(item.isFixed),
    categoryId: item.categoryId,
    categoryName: item.category?.name ?? undefined,
    accountId: item.accountId,
    accountName: item.account?.name ?? undefined,
    memo: item.memo ?? undefined,
    labelIds: Array.isArray(item.labels) ? item.labels : [],
  }));
};

export const createTransaction = async (
  body: CreateTransactionRequest,
): Promise<CreateTransactionResponse> => {
  const payload = {
    ...body,
    type: toServerTransactionType(body.type),
  };
  const res = await fetch(`${API_BASE_URL}/api/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('거래를 생성하지 못했습니다.');
  }

  const item = await res.json();

  return {
    id: item.id,
    type: mapServerTransactionType(item.type),
    amount: Number(item.amount),
    date: item.date,
    scheduledAt: item.scheduledAt ?? undefined,
    isFixed: Boolean(item.isFixed),
    categoryId: item.categoryId,
    categoryName: item.category?.name ?? undefined,
    accountId: item.accountId,
    accountName: item.account?.name ?? undefined,
    memo: item.memo ?? undefined,
    labelIds: Array.isArray(item.labels) ? item.labels : [],
  };
};

export const updateTransaction = async (
  id: string,
  body: UpdateTransactionRequest,
): Promise<UpdateTransactionResponse> => {
  const payload =
    body.type != null
      ? { ...body, type: toServerTransactionType(body.type) }
      : body;
  const res = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('거래를 수정하지 못했습니다.');
  }

  const item = await res.json();

  return {
    id: item.id,
    type: mapServerTransactionType(item.type),
    amount: Number(item.amount),
    date: item.date,
    scheduledAt: item.scheduledAt ?? undefined,
    isFixed: Boolean(item.isFixed),
    categoryId: item.categoryId,
    categoryName: item.category?.name ?? undefined,
    accountId: item.accountId,
    accountName: item.account?.name ?? undefined,
    memo: item.memo ?? undefined,
    labelIds: Array.isArray(item.labels) ? item.labels : [],
  };
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('거래를 삭제하지 못했습니다.');
  }
};

function mapServerTransactionType(value: string): TransactionType {
  const lower = value.toLowerCase();
  if (lower === 'income') return 'income';
  if (lower === 'expense') return 'expense';
  return 'transfer';
}

/** 클라이언트 type(소문자) → 서버 enum(대문자) */
function toServerTransactionType(value: TransactionType): string {
  return value.toUpperCase();
}

