# Demo Data Policy

## ステータス

- 決定日: 2026-08-11
- 状態: 採用

## 決定

`demo-user` はローカル開発で画面とDB操作を確認するためのseed fixtureとして扱い、GitHub OAuthで作成された通常ユーザーへ自動移行・自動コピーしません。

初回ユーザーの体験はDashboardのオンボーディングに一本化します。ユーザー自身が、実際のCompanyを登録するか、小さなスターターデータを明示的に作成します。本番環境とCIでは `prisma db seed` を通常フローに含めません。

## 理由

- `demo-user` と認証ユーザーの対応関係を安全に証明できない
- 自動移行すると、別ユーザーへのデータ開示やowner scoping破壊につながる
- ログインや再実行のたびに重複データを作る可能性がある
- seedの固定IDと通常CRUDの自動生成IDでは用途が異なる
- 初回オンボーディングが、空画面を解消する役割をすでに担っている

## コード上の境界

- アプリの通常処理は `DEMO_USER_ID` を参照しない
- seedは `demo-user` にだけ固定サンプルをupsertする
- seedと認証済みE2EはlocalhostのPostgreSQLだけをデフォルトで許可する
- remote DBを使う場合は、隔離済み環境であることを確認して明示的な許可変数を設定する
- owner scoping E2Eで、別ユーザーのCompany・Task・InterviewLogが表示されず、直URLも404になることを確認する

## 将来、本物の旧データ移行が必要になった場合

通常画面のServer Actionではなく、管理者向けの一回限りのmigration scriptとして別途設計します。実装前に最低限、次を必須とします。

1. source userとtarget userを明示し、本人確認方法を決める
2. DB backupを取得する
3. dry-runでCompany・Task・InterviewLog件数とID対応を出力する
4. transaction内で所有者と関連IDを更新または複製する
5. 再実行しても重複しない仕組みと監査ログを用意する
6. 移行後のowner scopingを自動テストする
7. 検証完了まではsource dataを削除しない

Prismaのschema migrationと、ユーザー間のdata migrationは別の作業として扱います。
