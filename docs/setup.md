# AI Job Hunt OS Setup Guide

このドキュメントは、AI Job Hunt OS をローカル環境で起動するための手順です。

現在のアプリは、認証をまだ実装していないローカル MVP です。データは `demo-user` 固定で扱い、Docker Compose で起動した PostgreSQL に保存します。

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

## 3. `.env.local` を用意する

`.env.example` が用意されているため、ローカル用の環境変数ファイルを作成します。

```bash
cp .env.example .env.local
```

`.env.local` には、ローカル開発用の `DATABASE_URL` や Docker Compose 用の PostgreSQL 設定を入れます。

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_job_hunt_os?schema=public"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DB="ai_job_hunt_os"
```

実際の `.env`、`.env.local`、`DATABASE_URL`、API キー、個人情報は commit しないでください。このリポジトリでは `.env.example` だけを共有用のサンプルとして commit します。

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

## 8. 開発サーバーを起動する

```bash
npm run dev
```

ブラウザで以下を開きます。

```text
http://localhost:3000
```

Dashboard が表示され、サンプルデータの応募状況、タスク、面接ログが確認できればセットアップ完了です。

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

## 注意事項

- 認証はまだ未実装です。
- 現在は `demo-user` 固定で DB を読み書きします。
- AI 機能はまだ未実装です。
- デプロイ手順はまだ整備していません。
- `.env`、`.env.local`、実際の `DATABASE_URL`、API キー、個人情報は commit しないでください。
- `.env.example` は既に存在します。現時点では新規作成は不要です。
