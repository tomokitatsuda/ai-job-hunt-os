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

`demo-user` は seed / 過去データ用のユーザーです。GitHub OAuth でログインしたユーザーとは別の `User` なので、ログイン直後に seed データが見えないのは、ユーザー分離が効いている正常な状態です。

## 8. 開発サーバーを起動する

```bash
npm run dev
```

ブラウザで以下を開きます。

```text
http://localhost:3000
```

未ログインの場合は `/login` に redirect されます。GitHub OAuth でログイン後、Dashboard が表示され、ログインユーザーの応募状況、タスク、面接ログが確認できればセットアップ完了です。初回ログイン直後に seed データが見えない場合は、ログインユーザー用の Company / Task / InterviewLog を作成して動作確認してください。

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

公開前の最小確認として、以下を実行します。

```bash
npm run lint
npx prisma validate
npm run build
```

## 注意事項

- Auth.js / GitHub OAuth の認証基盤は導入済みです。
- 通常動作では Auth.js の `session.user.id` ベースで DB を読み書きします。
- `demo-user` は seed / 過去データ用として残していますが、ログインユーザーへ自動移行はしません。
- AI 機能はまだ未実装です。
- デプロイ手順はまだ整備していません。
- `.env`、`.env.local`、本番 DB や個人用 DB の `DATABASE_URL`、OAuth secret、API キー、個人情報は commit しないでください。
- `.env.example` は既に存在します。現時点では新規作成は不要です。
