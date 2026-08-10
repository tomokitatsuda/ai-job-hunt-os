# AI Job Hunt OS

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Prisma 7](https://img.shields.io/badge/Prisma_7-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![Auth.js / NextAuth](https://img.shields.io/badge/Auth.js%20%2F%20NextAuth-000000?style=flat-square)
![GitHub OAuth](https://img.shields.io/badge/GitHub_OAuth-181717?style=flat-square&logo=github&logoColor=white)

AI Job Hunt OS は、就職活動の応募状況、選考予定、タスク、面接ログを一元管理するための Web アプリです。

現在は v0.5.0 相当として、Auth.js / GitHub OAuth の認証基盤と `session.user.id` ベースの owner scoping に加え、Next.js 16 Proxy による保護画面への未ログインアクセスの早期 redirect と Playwright E2E smoke test を導入済みです。

## 概要

就職活動では、応募先ごとの選考ステータス、面接日程、提出書類、次にやること、面接後の振り返りが複数のツールに分散しがちです。

AI Job Hunt OS では、就活に必要な情報を Company を中心に整理し、認証ユーザーごとのデータ管理や将来の AI 機能につなげられる土台を作ることを目指しています。

## 現在実装済みの機能

- Dashboard で DB 集計を表示
  - 応募企業数
  - 未完了 Task 数
  - 直近の Task 締切
  - 直近の面接日
  - 選考ステータス別件数
  - 志望度の高い Company
  - 直近の Task / InterviewLog
  - Task 一覧画面への導線
- Company 一覧表示
- Company 詳細表示
- Company 作成・編集・削除
- Company 詳細画面内での Task 表示・作成・完了切り替え・編集・削除
- Task 一覧画面での未完了 / 完了 Task 表示
- Task 一覧画面での完了 / 未完了切り替え
- Task 一覧画面での関連 Company へのリンク表示
- Task 一覧画面での一般 Task 作成
- Task 一覧画面からの Task 編集・削除
- Company 詳細画面内での InterviewLog 表示・作成・編集・削除
- Prisma + PostgreSQL による DB 保存
- Docker Compose によるローカル PostgreSQL 起動
- seed による demo user とサンプルデータ投入
- Auth.js / GitHub OAuth によるサインイン基盤
- Next.js 16 Proxy による Dashboard / Company / Task 画面の認証境界
- `getCurrentUserId()` による Auth.js session user ID の取得
- Company / Task / InterviewLog / Dashboard のログインユーザー単位の owner scoping

Task は Company 詳細画面内で作成・編集・削除でき、Task 一覧画面ではログインユーザーの全 Task を未完了 / 完了に分けて確認し、完了状態を切り替えられます。また、Task 一覧画面から Company に紐づかない一般 Task を作成できます。Task 一覧画面では、Company 紐づき Task と一般 Task の違いを確認しながら、title、memo / description、dueDate の編集と削除ができます。Task の Company 紐づけ変更、Company 選択つき Task 作成、InterviewLog 一覧画面は、実装済みとは扱っていません。

`src/proxy.ts` は `/`、`/companies/:path*`、`/tasks/:path*` を保護し、未ログイン時は Auth.js の callback URL を付けて `/login` へ redirect します。Proxy は入口での早期チェックとして使い、データ取得・更新時には引き続き `getCurrentUserId()` で `session.user.id` を確認します。ログイン後に作成した Company / Task は、その認証ユーザーの `userId` に紐づきます。seed で作成される `demo-user` データは認証ユーザーとは別の過去データ用ユーザーであり、ログイン直後に既存 seed データが見えないのは正常です。

## 認証後の確認

v0.4.0 相当では、未ログイン時の `/login` redirect、GitHub OAuth でのログイン / ログアウト、ログイン後の Company / Task / InterviewLog CRUD、Dashboard 集計、`demo-user` とログインユーザーのデータが混ざらないことを手動確認済みです。

詳細なチェックリストは [docs/auth-verification.md](docs/auth-verification.md) にまとめています。

## スクリーンショット

### Dashboard

![Dashboard screenshot](docs/assets/screenshots/dashboard.png)

DB に保存されたログインユーザーの応募状況を集計して、応募企業数、未完了 Task 数、直近の Task 締切、直近の面接日などを確認できる画面です。選考ステータス別件数や直近の Task / InterviewLog も、この画面から把握できます。
Dashboard には「企業を見る」「タスクを見る」「企業を追加」「一般タスクを追加」の導線を置いています。

### Company 一覧

![Company list screenshot](docs/assets/screenshots/companies.png)

登録済み Company の一覧を確認し、詳細画面への移動や Company の新規作成につなげる画面です。現在は、ログインユーザーに紐づく Company を表示します。

### Company 詳細

![Company detail screenshot](docs/assets/screenshots/company-detail.png)

Company の基本情報と、その Company に紐づく Task / InterviewLog をまとめて確認・更新できる画面です。Task の作成・完了切り替え・編集・削除、InterviewLog の表示・作成・編集・削除は、この詳細画面内で扱います。

### Task 一覧

![Task list screenshot](docs/assets/screenshots/tasks.png)

ログインユーザーの全 Task を未完了 / 完了に分けて確認できる画面です。Company に紐づく Task は関連 Company へのリンクを表示し、Company に紐づかない一般 Task は一般 Task として表示します。この画面から一般 Task の作成、Task の完了/未完了切り替え、編集、削除ができます。

## 現在未実装の機能

- demo-user データのログインユーザーへの自動移行
- 初期データ作成フロー
- AI 機能
- Task の Company 紐づけ変更
- Company 選択つき Task 作成
- InterviewLog 一覧画面
- 検索・フィルター・ソート
- デプロイ
- 本格的なテスト整備

Auth.js / GitHub OAuth の基盤、`/login`、サインイン / サインアウト action、アプリ画面を対象にした Proxy は導入済みです。初期データ作成フローはまだ実装していません。

## 設計上の工夫

Company を中心に Task と InterviewLog を紐づけています。就活では企業ごとに選考ステータス、次のアクション、準備タスク、面接ログが発生するため、まず Company 詳細画面で関連情報をまとめて確認・更新できる構成にしています。

また、最初から AI まで広げず、モックで情報設計を確認した後に Prisma + PostgreSQL へ移行し、その後 Auth.js / GitHub OAuth の基盤を追加しています。これにより、応募管理の中心データ、CRUD、ユーザー単位の owner scoping の流れを先に固めています。

ユーザー ID は `src/lib/current-user.ts` の `getCurrentUserId()` に集約しています。現在は Auth.js の `auth()` から `session.user.id` を取得し、未ログイン時は `/login` に redirect します。Proxy だけに認可を任せず、Company / Task は `userId`、InterviewLog は Company 経由で所有者確認する方針です。

Company 削除時は物理削除です。紐づく InterviewLog は削除し、Task は `companyId` を `null` にして一般タスクとして残す設計にしています。Task 一覧画面から作成する一般 Task も `companyId: null` として保存し、Company 紐づき Task と同じ `Task` モデルで扱います。

DB 接続は Prisma 7 前提の構成です。`DATABASE_URL` は `prisma.config.ts` と `.env` で扱い、`schema.prisma` の `datasource` には `url = env("DATABASE_URL")` を書かない方針にしています。`.env.local` はローカル上書き用に使えますが、基本セットアップは `.env.example` を `.env` にコピーする手順にしています。アプリ側では `src/lib/prisma.ts` で `@prisma/adapter-pg` を使って Prisma Client を生成しています。

## 技術スタック

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Auth.js / NextAuth
- @auth/prisma-adapter
- Prisma 7
- PostgreSQL
- Docker Compose
- ESLint

今後の候補として、AI 機能には OpenAI API などの利用を想定しています。

## Quick Start

必要なもの:

- Git
- Node.js / npm
- Docker / Docker Compose

ローカルでは Docker Compose で PostgreSQL を起動し、Prisma 7 + PostgreSQL に接続します。Auth.js / GitHub OAuth を使うため、`.env.example` を `.env` にコピーしたうえで、`AUTH_SECRET`、`AUTH_GITHUB_ID`、`AUTH_GITHUB_SECRET` をローカル環境用に設定してください。実値は commit しないでください。

```bash
npm install
cp .env.example .env
docker compose up -d
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

開発サーバー起動後、ブラウザで `http://localhost:3000` を開きます。未ログインの場合は `/login` に redirect され、GitHub OAuth でログイン後に Dashboard を確認できます。

## E2E smoke test

v0.5.0 相当では、Playwright による最低限の E2E smoke test を追加しています。対象ブラウザは Chromium のみで、`npm run test:e2e` は `webServer` 設定により `npm run dev` を起動し、`http://localhost:3000` に対して `/login` 表示と未ログイン時の `/`、`/companies`、`/companies/new`、`/tasks` から callback URL 付き `/login` への redirect を確認します。

```bash
npm run test:e2e
```

GitHub OAuth の実ログイン完走、ログイン済み CRUD、DB reset / seed、CI 連携、WebKit / Safari 相当の自動テストはまだ含めていません。

詳しい手順や確認コマンドは [docs/setup.md](docs/setup.md) を参照してください。`.env.example` の `DATABASE_URL` はローカル開発用 Docker 環境のサンプルです。`AUTH_SECRET`、`AUTH_GITHUB_ID`、`AUTH_GITHUB_SECRET` はプレースホルダーのみを置いています。実際の `.env` / `.env.local`、本番 DB や個人用 DB の接続情報、OAuth secret、API キー、個人情報は commit しないでください。

## AI 活用方針

AI 機能はまだ未実装です。将来的には、蓄積した Company / Task / InterviewLog をもとに、面接準備、振り返り整理、次アクション提案などを補助する機能を検討します。

ただし、就活データには個人情報や応募先情報が含まれるため、AI API に渡すデータ範囲、ログ保存、認証導入後のユーザー分離を整理してから実装する方針です。

## 今後の予定

1. README / docs の継続整備
2. 初期データ作成フロー、または demo-user データ移行方針の検討
3. 認証済み CRUD を含むテスト拡充
4. デプロイ準備
5. Task の Company 紐づけ変更、Company 選択つき Task 作成の検討
6. InterviewLog 一覧画面の検討
7. 検索・フィルター・ソートの追加
8. AI 機能の段階的な追加

詳細な設計方針は [docs/00-project-overview.md](docs/00-project-overview.md)、現在の実装状況は [docs/02-mvp-implementation-status.md](docs/02-mvp-implementation-status.md)、認証後の確認項目は [docs/auth-verification.md](docs/auth-verification.md) にまとめています。
