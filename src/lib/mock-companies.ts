export type CompanyStatus =
  | "応募準備"
  | "応募済み"
  | "書類選考"
  | "一次面接"
  | "最終面接"
  | "内定";

export type CompanyPriority = "高" | "中" | "低";

export type Company = {
  id: string;
  name: string;
  position: string;
  status: CompanyStatus;
  priority: CompanyPriority;
  nextAction: string;
  nextScheduledDate: string;
  updatedAt: string;
};

export const companies: Company[] = [
  {
    id: "company-001",
    name: "株式会社North Star AI",
    position: "フロントエンドエンジニア",
    status: "一次面接",
    priority: "高",
    nextAction: "面接想定質問を整理する",
    nextScheduledDate: "2026-05-28",
    updatedAt: "2026-05-22",
  },
  {
    id: "company-002",
    name: "Blue Ladder Labs",
    position: "プロダクトエンジニア",
    status: "書類選考",
    priority: "中",
    nextAction: "職務経歴書を送付する",
    nextScheduledDate: "2026-05-30",
    updatedAt: "2026-05-21",
  },
  {
    id: "company-003",
    name: "Green Field Works",
    position: "バックエンドエンジニア",
    status: "応募準備",
    priority: "中",
    nextAction: "求人票の必須要件を確認する",
    nextScheduledDate: "2026-06-03",
    updatedAt: "2026-05-20",
  },
  {
    id: "company-004",
    name: "株式会社Craft Base",
    position: "フルスタックエンジニア",
    status: "最終面接",
    priority: "高",
    nextAction: "逆質問を3つ準備する",
    nextScheduledDate: "2026-05-27",
    updatedAt: "2026-05-23",
  },
  {
    id: "company-005",
    name: "Orbit Systems",
    position: "AIアプリケーションエンジニア",
    status: "応募済み",
    priority: "低",
    nextAction: "返信期限を確認する",
    nextScheduledDate: "2026-06-05",
    updatedAt: "2026-05-19",
  },
];

export const getCompanyById = (id: string) =>
  companies.find((company) => company.id === id);
