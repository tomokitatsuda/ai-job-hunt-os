export type TaskPriority = "高" | "中" | "低";

export type Task = {
  id: string;
  companyId: string;
  name: string;
  dueDate: string;
  isCompleted: boolean;
  priority: TaskPriority;
  memo: string;
};

export const tasks: Task[] = [
  {
    id: "task-001",
    companyId: "company-001",
    name: "面接想定質問を整理する",
    dueDate: "2026-05-26",
    isCompleted: false,
    priority: "高",
    memo: "プロダクト開発経験とAI活用経験を中心に回答を準備する。",
  },
  {
    id: "task-002",
    companyId: "company-001",
    name: "企業ブログを確認する",
    dueDate: "2026-05-27",
    isCompleted: false,
    priority: "中",
    memo: "直近の技術記事から質問に使えそうな話題を拾う。",
  },
  {
    id: "task-003",
    companyId: "company-001",
    name: "カジュアル面談のお礼を送る",
    dueDate: "2026-05-23",
    isCompleted: true,
    priority: "低",
    memo: "担当者への返信済み。",
  },
  {
    id: "task-004",
    companyId: "company-002",
    name: "職務経歴書を送付する",
    dueDate: "2026-05-30",
    isCompleted: false,
    priority: "高",
    memo: "プロダクト改善の実績を冒頭に追記してから送る。",
  },
  {
    id: "task-005",
    companyId: "company-002",
    name: "応募理由を一段落で整理する",
    dueDate: "2026-05-29",
    isCompleted: false,
    priority: "中",
    memo: "事業領域への関心と開発体制への期待を簡潔にまとめる。",
  },
  {
    id: "task-006",
    companyId: "company-003",
    name: "求人票の必須要件を確認する",
    dueDate: "2026-06-03",
    isCompleted: false,
    priority: "中",
    memo: "Goとクラウド運用経験の要件を自分の実績に対応づける。",
  },
  {
    id: "task-007",
    companyId: "company-003",
    name: "ポートフォリオの該当箇所を更新する",
    dueDate: "2026-06-02",
    isCompleted: false,
    priority: "高",
    memo: "バックエンド設計と運用改善の説明を追加する。",
  },
  {
    id: "task-008",
    companyId: "company-003",
    name: "応募前チェックリストを確認する",
    dueDate: "2026-06-01",
    isCompleted: true,
    priority: "低",
    memo: "応募書類の不足がないことを確認済み。",
  },
  {
    id: "task-009",
    companyId: "company-004",
    name: "逆質問を3つ準備する",
    dueDate: "2026-05-27",
    isCompleted: false,
    priority: "高",
    memo: "最終面接向けにチーム体制、評価制度、事業優先度を聞く。",
  },
];

export const getTasksByCompanyId = (companyId: string) =>
  tasks.filter((task) => task.companyId === companyId);

export const getIncompleteTaskCountByCompanyId = (companyId: string) =>
  getTasksByCompanyId(companyId).filter((task) => !task.isCompleted).length;
