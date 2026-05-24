export type InterviewType =
  | "カジュアル面談"
  | "一次面接"
  | "二次面接"
  | "最終面接";

export type InterviewLog = {
  id: string;
  companyId: string;
  interviewDate: string;
  interviewType: InterviewType;
  questions: string[];
  answerMemo: string;
  goodPoints: string;
  improvementPoints: string;
  nextPreparation: string;
};

export const interviewLogs: InterviewLog[] = [
  {
    id: "interview-log-001",
    companyId: "company-001",
    interviewDate: "2026-05-21",
    interviewType: "カジュアル面談",
    questions: [
      "これまでのフロントエンド開発で、特に成果が出た改善は何ですか。",
      "AIを使った開発支援をチームに導入するなら、どこから始めますか。",
    ],
    answerMemo:
      "既存画面の表示速度改善と、レビュー前チェックの自動化について説明した。AI活用は小さな定型作業から始め、効果測定を挟む方針を話した。",
    goodPoints:
      "実績を数字とユーザー影響に結びつけて説明できた。相手の開発体制に合わせて質問を返せた。",
    improvementPoints:
      "AI活用の失敗例やリスク管理について、もう少し具体例を添えられるとよかった。",
    nextPreparation:
      "一次面接に向けて、プロダクト改善の意思決定プロセスと技術選定理由を整理する。",
  },
  {
    id: "interview-log-002",
    companyId: "company-001",
    interviewDate: "2026-05-24",
    interviewType: "一次面接",
    questions: [
      "複雑な状態管理をどのように整理しましたか。",
      "短い期間で品質を落とさずにリリースするために意識していることは何ですか。",
    ],
    answerMemo:
      "状態の責務を画面単位と共有データで分けた経験を説明した。リリース前は影響範囲を小さくし、テスト観点を先に揃えると回答した。",
    goodPoints:
      "設計判断の背景を、チーム運用と保守性の観点で話せた。",
    improvementPoints:
      "テスト戦略の説明が抽象的だったため、具体的なテスト種別と境界を補足したい。",
    nextPreparation:
      "次回はコードレビュー、障害対応、技術負債の扱いについて具体例を用意する。",
  },
  {
    id: "interview-log-003",
    companyId: "company-002",
    interviewDate: "2026-05-20",
    interviewType: "カジュアル面談",
    questions: [
      "プロダクトエンジニアとして、企画段階から関わった経験はありますか。",
      "ユーザー課題の優先度をどう判断しますか。",
    ],
    answerMemo:
      "問い合わせログと利用データを見ながら、影響人数と解決コストで優先順位をつけた経験を話した。",
    goodPoints:
      "ビジネス側との合意形成まで含めて説明できた。",
    improvementPoints:
      "技術的な実装詳細を聞かれたとき、少し説明が長くなった。",
    nextPreparation:
      "書類選考後の面接に備えて、職務経歴書の代表プロジェクトを3分で説明できるようにする。",
  },
  {
    id: "interview-log-004",
    companyId: "company-004",
    interviewDate: "2026-05-18",
    interviewType: "二次面接",
    questions: [
      "フルスタックで担当するとき、どのレイヤーから設計を始めますか。",
      "チーム内で意見が割れたときにどう進めますか。",
    ],
    answerMemo:
      "ユーザー操作とデータの流れを先に揃え、API境界と画面責務を決める進め方を説明した。意見が割れた場合は判断軸を明文化すると話した。",
    goodPoints:
      "技術とコミュニケーションの両面で、再現性のある進め方を示せた。",
    improvementPoints:
      "最終面接に向けて、事業理解と入社後に貢献したい領域の解像度を上げたい。",
    nextPreparation:
      "逆質問では、半年後に期待される成果とチームの意思決定プロセスを確認する。",
  },
];

export const getInterviewLogsByCompanyId = (companyId: string) =>
  interviewLogs.filter((interviewLog) => interviewLog.companyId === companyId);
