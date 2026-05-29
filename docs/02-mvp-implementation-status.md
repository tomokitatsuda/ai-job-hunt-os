# AI Job Hunt OS MVP Implementation Status

## このドキュメントの目的

このドキュメントは、AI Job Hunt OS のモック MVP から DB 操作、Auth.js 基盤導入段階まで、現在どこまで実装されているかを整理するためのメモです。

最初はモックデータを使って、企業一覧、企業詳細、企業に紐づくタスク、面接ログを画面で確認できる状態にしました。その後、Prisma 7 + PostgreSQL + Docker Compose を導入し、現在は Auth.js / GitHub OAuth の認証基盤を入れ、Company を中心に Task と InterviewLog を紐づけてログインユーザー単位で DB 操作を確認する段階まで進んでいます。

Company は一覧、詳細、作成、編集、削除まで実装済みです。Task は企業詳細画面内で表示・作成・更新・削除でき、Task 一覧画面でもログインユーザーの全 Task を未完了 / 完了に分けて確認できます。また、Task 一覧画面から Company に紐づかない一般 Task を作成し、Task 一覧画面から一般 Task と Company 紐づき Task の編集・削除もできます。InterviewLog は、まず企業詳細画面内で表示・作成・更新・削除できる最小構成にしています。Dashboard では DB 由来の集計を表示できる状態になっています。

Auth.js / GitHub OAuth 基盤、`/login`、サインイン / サインアウト action、Auth.js session user ID に基づく owner scoping は導入済みです。`src/lib/current-user.ts` の `getCurrentUserId()` は Auth.js の `auth()` から `session.user.id` を取得し、未ログイン時は `/login` に redirect します。Company / Task / InterviewLog / Dashboard はログインユーザーごとにデータが分離されます。

ただし、middleware/proxy による全画面保護、demo-user データのログインユーザーへの自動移行、初期データ作成フロー、AI 機能、Task の Company 紐づけ変更、Company 選択つき Task 作成、検索・フィルター・ソート、InterviewLog 一覧画面はまだ実装していません。seed による `demo-user` データは認証ユーザーとは別であり、ログイン直後に既存 seed データが見えないのは正常です。

就活 GitHub として読まれたときに、現在の実装範囲、まだ実装していない範囲、次に進む候補が伝わることを目的にしています。

## 1. 現在実装済みの画面

### `/`

Dashboard 画面です。

DB からログインユーザーの Company / Task / InterviewLog を読み込み、応募企業数、未完了 Task 数、直近の Task 締切、直近の面接日、選考ステータス別件数、志望度の高い Company、直近の Task / InterviewLog を表示しています。

「企業を見る」「タスクを見る」「企業を追加」「一般タスクを追加」の導線も置いています。

### `/tasks`

Task 一覧画面です。

DB からログインユーザーの全 Task を読み込み、未完了 Task と完了 Task に分けて表示しています。

この画面から、Task の完了/未完了を切り替えられます。また、関連 Company がある Task では Company 詳細画面へのリンクを表示します。

この画面から、Company に紐づかない一般 Task を作成できます。一般 Task は `companyId: null` として保存します。

この画面では、一般 Task と Company 紐づき Task の違いが分かる説明・表示を置いています。また、一般 Task と Company 紐づき Task の title、memo / description、dueDate を編集でき、Task 削除もできます。

現時点では、Task の Company 紐づけ変更と、Company 選択つき Task 作成はまだ実装していません。

### `/companies`

企業一覧画面です。

現在は DB から `Company` 一覧を読み込み、応募先企業を一覧表示しています。企業名、応募ポジション、選考ステータス、志望度、次のアクション、次回予定日、未完了タスク数、最終更新日を確認できます。

企業名をクリックすると、各企業の詳細画面へ移動できます。

また、企業作成画面へ移動できます。

### `/companies/[id]`

企業詳細画面です。

DB から `Company` 詳細、関連する `Task`、`InterviewLog` を読み込み、企業ごとの選考状況、次のアクション、未完了タスク数、関連タスク、面接ログを確認できます。

この画面から、企業編集、企業削除、Company に紐づく Task 作成、Task の完了/未完了切り替え、Task 編集、Task 削除、Company に紐づく InterviewLog 作成、InterviewLog 編集、InterviewLog 削除ができます。

URL の `id` に対応する企業が存在しない場合は、404 ページになります。

### `/companies/new`

企業作成画面です。

ログインユーザーに紐づく Company を新規作成できます。

### `/companies/[id]/edit`

企業編集画面です。

ログインユーザーに紐づく Company の内容を編集できます。

### `/companies/[id]/tasks/[taskId]/edit`

Company 詳細画面から遷移する Task 編集画面です。

ログインユーザーに紐づく Task の内容を編集できます。Task 一覧画面からの編集とは別で、現在は Company 詳細画面内の操作を補完する画面として扱います。

### `/companies/[id]/interview-logs/[interviewLogId]/edit`

Company 詳細画面から遷移する InterviewLog 編集画面です。

対象 Company に紐づく InterviewLog の内容を編集できます。企業をまたいだ InterviewLog 一覧画面はまだ実装していません。

## 2. 現在の DB 構成

Prisma 7 を導入し、ローカル開発では Docker Compose で PostgreSQL を起動できる構成にしています。

`DATABASE_URL` は `.env` と `prisma.config.ts` で扱っています。Prisma 7 前提のため、`schema.prisma` の `datasource` には `url = env("DATABASE_URL")` を書かず、`provider = "postgresql"` のみを定義しています。

アプリ側の Prisma Client は `src/lib/prisma.ts` で生成し、`@prisma/adapter-pg` を使って PostgreSQL に接続しています。

初回 migration は作成済みです。また、seed により demo user と、Company / Task / InterviewLog のサンプルデータを投入できる状態にしています。

現在の主なモデルは以下です。

- `User`
- `Account`
- `Session`
- `VerificationToken`
- `Company`
- `Task`
- `InterviewLog`
- `ApplicationStatus`

Auth.js / GitHub OAuth 基盤のため、`Account`、`Session`、`VerificationToken` を追加しています。`User.email` は Auth.js adapter に合わせて nullable unique として扱います。

`getCurrentUserId()` は Auth.js の `auth()` から `session.user.id` を取得します。未ログイン時は `/login` に redirect します。Company / Task は `userId` で絞り、InterviewLog は Company 経由で所有者確認する形にしています。

seed による `demo-user` は、過去データやローカル確認用のユーザーとして残しています。ただし、GitHub OAuth でログインした認証ユーザーとは別の `User` なので、ログイン直後に seed の Company / Task が見えないのは正常です。ログイン後に作成した Company / Task は、そのログインユーザーの `userId` に紐づきます。

## 3. 現在の技術スタック

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Auth.js / NextAuth (`next-auth@^5.0.0-beta.31`)
- `@auth/prisma-adapter@^2.11.2`
- Prisma 7
- PostgreSQL
- Docker Compose
- `@prisma/adapter-pg`
- ESLint

AI API、デプロイ環境、本格的なテスト基盤はまだ導入していません。

## 4. 初期モックデータ構成

以下の `src/lib/mock-*` は、初期モック実装時のデータ定義として残っています。

### `src/lib/mock-companies.ts`

企業データを管理しているモックデータです。

主に以下の情報を持っています。

- 企業 ID
- 企業名
- 応募ポジション
- 選考ステータス
- 志望度
- 次のアクション
- 次回予定日
- 最終更新日

また、企業 ID から企業を取得するための `getCompanyById` も定義しています。

### `src/lib/mock-tasks.ts`

タスクデータを管理しているモックデータです。

各タスクは `companyId` を持っており、Company に紐づく形にしています。

主に以下の情報を持っています。

- タスク ID
- 紐づく企業 ID
- タスク名
- 期限
- 完了状態
- 優先度
- メモ

また、企業 ID から関連タスクを取得する `getTasksByCompanyId` と、未完了タスク数を取得する `getIncompleteTaskCountByCompanyId` も定義しています。

### `src/lib/mock-interview-logs.ts`

面接ログデータを管理しているモックデータです。

各面接ログは `companyId` を持っており、Company に紐づく形にしています。

主に以下の情報を持っています。

- 面接ログ ID
- 紐づく企業 ID
- 面接日
- 面接種別
- 質問された内容
- 自分の回答メモ
- 良かった点
- 改善点
- 次回に向けた対策

また、企業 ID から面接ログを取得する `getInterviewLogsByCompanyId` も定義しています。

## 5. 現在できること

現在の DB 操作、Auth.js 基盤導入段階では、以下のことができます。

- Dashboard で DB 由来の集計を表示できる
- 応募企業数、未完了 Task 数、直近の Task 締切、直近の面接日を確認できる
- 選考ステータス別件数を確認できる
- 志望度の高い Company を確認できる
- 直近の Task / InterviewLog を確認できる
- Dashboard から Task 一覧画面へ移動できる
- 企業一覧を DB から表示できる
- 企業詳細を DB から表示できる
- 企業を作成できる
- 企業を編集できる
- 企業を削除できる
- 企業ごとの関連タスクを DB から表示できる
- 企業詳細画面内で、Company に紐づく Task を作成できる
- 企業詳細画面内で、Task の完了/未完了を切り替えられる
- 企業詳細画面内で、Task を編集・削除できる
- Auth.js / GitHub OAuth でサインインできる
- `getCurrentUserId()` で Auth.js session user ID を取得できる
- 未ログイン時に `/login` へ redirect できる
- Company / Task / InterviewLog / Dashboard のデータをログインユーザーごとに分離できる
- Task 一覧画面で、ログインユーザーの全 Task を未完了 / 完了に分けて表示できる
- Task 一覧画面で、Task の完了/未完了を切り替えられる
- Task 一覧画面で、関連 Company へのリンクを表示できる
- Task 一覧画面で、Company に紐づかない一般 Task を作成できる
- Task 一覧画面で、一般 Task と Company 紐づき Task の違いを確認できる
- Task 一覧画面で、一般 Task と Company 紐づき Task を編集・削除できる
- 企業ごとの面接ログを DB から表示できる
- 企業詳細画面内で、Company に紐づく InterviewLog を作成できる
- 企業詳細画面内で、InterviewLog を編集・削除できる
- 企業一覧から企業詳細へ移動できる
- 存在しない企業 ID にアクセスした場合は 404 になる

Task は Company 詳細画面内で表示・作成・更新・削除でき、Task 一覧画面ではログインユーザーの全 Task の確認、完了状態の切り替え、一般 Task の作成、Task の編集・削除ができます。InterviewLog は、まず企業詳細画面内で表示・作成・更新・削除できる最小構成にしています。

## 6. まだ実装していないこと

以下はまだ実装していません。

- middleware/proxy による全画面保護
- demo-user データのログインユーザーへの自動移行
- 初期データ作成フロー
- AI 機能
- Task の Company 紐づけ変更
- Company 選択つき Task 作成
- 検索・フィルター・ソート
- InterviewLog 一覧画面
- デプロイ
- テスト本格整備

この段階では、完成済みのアプリとしてではなく、モック MVP から DB 操作、Auth.js 基盤導入へ段階的に進めている途中として扱います。

## 7. 現在の設計意図

AI Job Hunt OS では、Company を中心に Task と InterviewLog を紐づける設計にしています。

就活では、企業ごとに選考ステータス、次のアクション、準備タスク、面接の振り返りが発生します。そのため、まず Company を中心に置き、そこから関連する情報を確認できる形にしています。

最初から DB、認証、AI 機能まで実装すると、確認すべき範囲が広くなります。そのため、最初はモックデータを使い、画面構成と情報設計が自然かどうかを先に確認しました。

その後、Prisma + PostgreSQL に移行し、`/companies` と `/companies/[id]` は DB 由来のデータを表示するようにしました。Company は中心データとして CRUD まで進め、応募先企業を登録、確認、更新、削除できる状態にしています。

Task と InterviewLog は、まず企業詳細画面内で表示・作成・更新・削除できる最小構成にしました。Company に紐づけて作成し、Task は完了/未完了の切り替えも確認できるようにしています。さらに Task 一覧画面では、ログインユーザーの全 Task を未完了 / 完了に分けて確認し、関連 Company へ移動できるようにしています。また、Task 一覧画面では Company に紐づかない一般 Task も作成でき、一般 Task と Company 紐づき Task の違いを確認しながら編集・削除できます。一方で、Task の Company 紐づけ変更、Company 選択つき Task 作成、検索・フィルター・ソート、InterviewLog 一覧画面はまだ未実装です。

Auth.js / GitHub OAuth の基盤を導入し、`getCurrentUserId()` は Auth.js session user ID を返す形に切り替えました。これにより、Company / Task / InterviewLog / Dashboard はログインユーザーごとのデータ取得になっています。ただし、middleware/proxy による全画面保護、初期データ作成フロー、demo-user データの自動移行はまだ未実装です。

### Company 削除について

現時点の Company 削除は物理削除です。削除時には、対象の Company が currentUserId に属していることを確認しています。
現時点では `getCurrentUserId()` が Auth.js の `session.user.id` を返します。未ログイン時は `/login` に redirect します。

Company に紐づく InterviewLog は削除します。一方で、Company に紐づく Task は削除せず、`companyId` を `null` にして一般タスクとして残します。これらの処理は transaction 内で実行しています。

Task 一覧画面から作成する一般 Task も `companyId: null` として保存し、Company に紐づく Task と同じ `Task` モデルで扱います。

現時点では復元機能はありません。画面上では、削除すると元に戻せないことを明示しています。

論理削除、監査ログ、削除確認の強化、復元機能、バックアップや保持期間との整合性、外部サービスやファイル削除との連携は、今後の検討事項とします。

## 8. 次に進む候補

次に進む候補は以下です。

- README / docs の継続整備
- middleware/proxy による全画面保護
- 初期データ作成フロー、または demo-user データ移行方針の検討
- 最低限のテスト導入
- デプロイ準備
- Task の Company 紐づけ変更、Company 選択つき Task 作成の検討
- InterviewLog 一覧画面の検討
- 検索・フィルター・ソート
- AI 機能

## 9. 面接で説明できるポイント

この段階で説明できるポイントは以下です。

- いきなり DB 実装に進まず、まずモックで画面構成と情報設計を確認してから DB に移行した
- Company / Task / InterviewLog の責務を分けた
- Task と InterviewLog は Company に紐づく設計にした
- Company は CRUD まで進め、Task と InterviewLog は企業詳細画面内で表示・作成・更新・削除できる最小構成にした
- Task 一覧画面でログインユーザーの全 Task を未完了 / 完了に分けて確認し、完了状態を切り替え、一般 Task の作成と Task の編集・削除ができるようにした
- Dashboard では DB 集計により、応募状況、未完了タスク、直近予定を一画面で確認できるようにした
- demo user 固定で DB 操作を先に検証した後、Auth.js session user ID ベースの owner scoping に切り替えた
- seed の demo-user データは認証ユーザーとは別であり、ログイン直後に見えないのは正常な状態として整理した
- seed により、ローカル開発環境で再現できるサンプルデータを用意した
- 存在しない企業 ID は 404 にして、最低限の異常系も扱った

現時点の目的は、完成済みの多機能アプリを見せることではありません。就活情報を管理するうえで中心になるデータを整理し、モックで画面を確認したうえで、DB 操作、Dashboard 集計、Auth.js session user ID ベースの owner scoping へ段階的に移行できていることを示すことです。
