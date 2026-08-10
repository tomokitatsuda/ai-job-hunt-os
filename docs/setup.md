# AI Job Hunt OS Setup Guide

このドキュメントは、AI Job Hunt OS をローカル環境で起動するための手順です。

現在のアプリは、Auth.js / GitHub OAuth の認証基盤を導入したローカル MVP です。通常動作ではログインユーザーごとに Company / Task / InterviewLog / Dashboard のデータを分離し、Docker Compose で起動した PostgreSQL に保存します。

## 必要なもの

- Git
- Node.js
- npm
- Docker / Docker Compose

Node.js と npm は、プロジェクトの依存関係をインストールして Next.js を起動するために使います。Docker / Docker Compose は、ローカル PostgreSQL を起動するために使います。

## 1. リポジトリを clone する

```bash
git clone <repository-url>
cd ai-job-hunt-os
```

`<repository-url>` は、このリポジトリの URL に置き換えてください。

## 2. 依存関係をインストールする

```bash
npm install
```

このプロジェクトでは、Next.js App Router、TypeScript、Tailwind CSS、Prisma 7、PostgreSQL 関連のパッケージを使います。

## 3. `.env` を用意する

`.env.example` が用意されているため、ローカル用の環境変数ファイルを作成します。Prisma CLI は `prisma.config.ts` の `dotenv/config` 経由で `.env` を読みます。

```bash
cp .env.example .env
```

`.env` には、ローカル開発用の `DATABASE_URL`、Docker Compose 用の PostgreSQL 設定、Auth.js / GitHub OAuth 用の設定を入れます。

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_job_hunt_os?schema=public"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DB="ai_job_hunt_os"
AUTH_SECRET=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
ALLOW_REMOTE_SEED="false"
ALLOW_REMOTE_E2E_DATABASE="false"
```

この `DATABASE_URL` は、Docker Compose で起動するローカル開発用 PostgreSQL への接続サンプルです。`AUTH_SECRET`、`AUTH_GITHUB_ID`、`AUTH_GITHUB_SECRET` はローカル用の実値を `.env` に設定してください。本番 DB や個人用 DB の接続情報、OAuth secret、API キー、個人情報は記載・commit しないでください。このリポジトリでは `.env.example` だけを共有用のサンプルとして commit します。

GitHub OAuth を使うには、GitHub 側でローカル開発用の OAuth App を作成し、client ID を `AUTH_GITHUB_ID`、client secret を `AUTH_GITHUB_SECRET` に設定します。ローカル開発時の callback URL は `http://localhost:3000/api/auth/callback/github` です。`AUTH_SECRET` にはローカル用の十分に長いランダム文字列を設定します。いずれも実値は README / docs / commit に残さないでください。

Next.js 側だけでローカル設定を上書きしたい場合は `.env.local` も使えます。ただし、Prisma CLI との説明をそろえるため、基本セットアップでは `.env` を使います。

補足: 現在の `prisma.config.ts` は Prisma 7 前提で `DATABASE_URL` を扱います。`schema.prisma` の `datasource` には `url = env("DATABASE_URL")` を書かない構成です。

## 4. Docker で PostgreSQL を起動する

```bash
docker compose up -d
```

起動できたか確認します。

```bash
docker compose ps
```

`db` サービスが起動していれば OK です。PostgreSQL は通常 `localhost:5432` で待ち受けます。

## 5. Prisma Client を生成する

```bash
npx prisma generate
```

Prisma Client は `schema.prisma` をもとに生成されます。このプロジェクトでは生成物を `src/generated/prisma` に出力しますが、生成物は commit しません。

## 6. migration を適用する

```bash
npx prisma migrate dev
```

既存の migration をローカル PostgreSQL に適用します。今回のセットアップ手順では、新しい migration は作成しません。

## 7. seed を投入する

```bash
npx prisma db seed
```

seed により、`demo-user` とサンプルの Company / Task / InterviewLog が作成されます。

`demo-user` はローカル開発用のfixtureです。GitHub OAuthでログインしたユーザーとは別の `User` なので、ログイン直後にseedデータが見えないのは、ユーザー分離が効いている正常な状態です。通常ユーザーへの自動移行・コピーは行いません。

誤って本番DBへサンプルを投入しないよう、seedはlocalhostのDBだけをデフォルトで許可します。隔離したremote development DBへ投入する必要がある場合だけ、一時的に `ALLOW_REMOTE_SEED=true` を設定してください。

## 8. 開発サーバーを起動する

```bash
npm run dev
```

ブラウザで以下を開きます。

```text
http://localhost:3000
```

未ログインの場合は `/login` に redirect されます。GitHub OAuth でログイン後、Dashboard が表示され、ログインユーザーの応募状況、タスク、面接ログが確認できればセットアップ完了です。初回ログイン直後に seed データが見えない場合は、Dashboard のオンボーディングから最初の Company を登録するか、スターターデータを作成して操作を確認できます。

## 9. E2E テストを実行する

E2E テストは `DATABASE_URL` の PostgreSQL に一時 User / Session と CRUD 対象データを作成します。Docker の DB を起動し、migration を適用してから実行してください。終了時にテストユーザーと関連データを削除しますが、本番 DB ではなくローカルの開発・テスト用 DB を使用してください。

```bash
docker compose up -d
npx prisma migrate dev
npx playwright install chromium webkit
npm run test:e2e
```

ChromiumとWebKitのそれぞれで、未認証の画面保護5本と、owner isolation・初回オンボーディング・Company・Task・InterviewLogの認証済み操作5本を確認します。Playwrightの `webServer` が開発サーバーを自動起動するため、別ターミナルで `npm run dev` を起動する必要はありません。

対象を分けて実行する場合は、次のコマンドを使います。

```bash
npm run test:e2e:auth-boundary
npm run test:e2e:authenticated
npm run test:e2e:chromium
npm run test:e2e:webkit
```

認証済みE2Eは誤操作防止のためlocalhostのDBだけをデフォルトで許可します。remote test DBを使う場合は、必ず本番から隔離したDBであることを確認してから `ALLOW_REMOTE_E2E_DATABASE=true` を設定してください。

## GitHub Actions CI

`.github/workflows/ci.yml` は `main` への push、`main` 向け pull request、手動実行で起動します。GitHub Actions内に使い捨てのPostgreSQL 17を用意し、次を順番に実行します。

1. `npm ci`
2. `npx prisma migrate deploy`
3. `npm run lint`
4. `npx prisma validate`
5. `npm run test:unit`
6. `npm run build`
7. Chromium / WebKit のインストールと `npm run test:e2e`

CIでは先にbuildしたアプリを `npm run start` で起動してE2Eを実行します。localhostのproduction serverをAuth.jsに許可する `AUTH_TRUST_HOST=true` もCI内だけで設定します。Playwright HTML reportはGitHub Actionsのartifactとして14日間保存されます。CI用のDB・Auth.js・GitHub OAuth値はworkflow内の使い捨て／placeholderであり、実際のOAuth secretは使用しません。

## よくある確認コマンド

Docker の起動状況を確認します。

```bash
docker compose ps
```

Docker のログを確認します。

```bash
docker compose logs db
```

Prisma Studio で DB の中身を確認します。

```bash
npx prisma studio
```

Next.js の開発サーバーを起動します。

```bash
npm run dev
```

Lint を実行します。

```bash
npm run lint
```

DB安全判定のunit testを実行します。

```bash
npm run test:unit
```

E2E テストを実行します。

```bash
npm run test:e2e
```

公開前の最小確認として、以下を実行します。

```bash
npm run lint
npx prisma validate
npm run test:unit
npm run test:e2e
npm run build
```

## 注意事項

- Auth.js / GitHub OAuth の認証基盤は導入済みです。
- 通常動作では Auth.js の `session.user.id` ベースで DB を読み書きします。
- `demo-user` はローカル開発fixtureとして残し、ログインユーザーへ移行・コピーしません。
- 初回ユーザーは Dashboard から、明示操作でスターターデータを作成できます。
- E2E テストは `DATABASE_URL` の DB を操作するため、本番 DB に向けて実行しないでください。
- AI 機能はまだ未実装です。
- デプロイ手順はまだ整備していません。
- `.env`、`.env.local`、本番 DB や個人用 DB の `DATABASE_URL`、OAuth secret、API キー、個人情報は commit しないでください。
- `.env.example` は既に存在します。現時点では新規作成は不要です。
