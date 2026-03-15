import { API_BASE_URL } from '../../common/config/apiConfig';

export interface MonthlyCategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  spent: number;
  budget: number | null;
}

export interface GetMonthlySummaryResponse {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  todayExpense: number;
  categoryBreakdown: MonthlyCategoryBreakdownItem[];
}

export const getMonthlySummary = async (
  year: number,
  month: number,
): Promise<GetMonthlySummaryResponse> => {
  const url = new URL('/api/summary/monthly', API_BASE_URL);
  url.searchParams.set('year', String(year));
  url.searchParams.set('month', String(month));

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error('월별 요약을 불러오지 못했습니다.');
  }

  const data = await res.json();

  return {
    year: data.year,
    month: data.month,
    totalIncome: Number(data.totalIncome),
    totalExpense: Number(data.totalExpense),
    todayExpense: Number(data.todayExpense),
    categoryBreakdown: Array.isArray(data.categoryBreakdown)
      ? data.categoryBreakdown.map((item: any) => ({
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          spent: Number(item.spent),
          budget: item.budget != null ? Number(item.budget) : null,
        }))
      : [],
  };
};

