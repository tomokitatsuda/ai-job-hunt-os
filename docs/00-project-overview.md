# AI Job Hunt OS Project Overview

## プロジェクトの目的

AI Job Hunt OS は、就職活動に必要な情報を一元管理する Web アプリです。

目的は、応募先、選考状況、面接予定、タスク、振り返りを一つの場所にまとめ、就活の進捗を見失わない状態を作ることです。将来的には、蓄積したメモや応募履歴をもとに AI が準備を補助する仕組みも追加します。

## 解決したい課題

就活では、応募先ごとに管理する情報が多くなります。

- どの企業に応募したか忘れやすい
- 選考ステータスがスプレッドシートやメモに分散する
- 面接日程や提出期限の確認が面倒になる
- 面接後の振り返りが残らず、次の準備に活かしにくい
- AI を使う場合も、元になる情報が整理されていないと活用しづらい

このプロジェクトでは、まず人が見て管理しやすい情報構造を作り、その後で AI が支援しやすい形に発展させます。

## 想定ユーザー

主な想定ユーザーは、就職活動中の学生や転職活動中の個人です。

特に、複数社へ応募していて、応募状況、面接準備、タスク管理を一つの場所で整理したい人を想定しています。

## v1.0 MVP の範囲と現在地

v1.0 MVP では、応募管理の基本体験に絞ります。

初期フェーズではモックデータで画面構成と情報設計を確認しました。現在は Next.js App Router + TypeScript + Tailwind CSS に加えて、Prisma 7 + PostgreSQL + Docker Compose によるローカル DB 保存へ移行済みです。また、Auth.js / GitHub OAuth の基盤と Next.js 16 Proxy による画面保護を導入し、ログインユーザーごとに Company / Task / InterviewLog / Dashboard のデータを分離しています。初回オンボーディングと主要 CRUD は Playwright でも自動確認できます。

Company と Task がない初回ユーザーには Dashboard でセットアップを案内し、サンプル Company 1 件と Task 2 件を作成できます。ただし、demo-user データのログインユーザーへの自動移行は未実装です。seed の `demo-user` データは認証ユーザーとは別であり、ログイン直後に既存 seed データが見えないのは正常です。

- 応募先企業の管理
- 企業ごとの選考ステータス
- 面接日程、提出締切、次アクションの管理
- 応募先ごとのメモ、面接ログ、志望度、振り返り
- 全体の進捗を確認するダッシュボード
- Company 詳細画面内でのタスク管理
- Task 一覧画面でのタスク管理
- Task の Company 選択つき作成・紐づけ変更
- PostgreSQL へのデータ保存
- Prisma を使った基本的な CRUD
- Auth.js session user ID に基づく owner scoping
- Next.js 16 Proxy によるアプリ画面の認証境界
- 初回ユーザー向けオンボーディングとスターターデータ作成
- Playwright による未認証境界と認証済み主要 CRUD の E2E テスト
- Chromium / WebKit と GitHub Actions による継続的な自動検証

MVP の目的は、就活情報を一覧し、次に何をすべきか判断できる状態を作ることです。

## 現在未実装のこと

以下は現在未実装です。

- demo-user データのログインユーザーへの自動移行
- AI による文章生成
- AI による面接対策
- InterviewLog 一覧画面
- 検索・フィルター・ソート
- デプロイ
- GitHub OAuth の実ログインを含む外部サービス連携テスト

Auth.js / GitHub OAuth 基盤、`/login`、サインイン / サインアウト action、Dashboard / Company / Task 画面の Proxy 保護は導入済みです。

## v1.0 でやらないこと

v1.0 では、以下は実装しません。

- AI による文章生成
- AI による面接対策
- 外部サービス連携
- 複数ユーザーでの共有
- 高度な通知機能

現時点では、Company を中心にした情報設計、DB 保存、基本 CRUD、Dashboard 集計、認証ユーザー単位の owner scoping を優先しています。

## 技術スタック

現時点で導入済みの技術は以下です。

- Next.js App Router: Web アプリのフレームワーク
- React: UI 構築
- TypeScript: 型安全な実装
- Tailwind CSS: スタイリング
- ESLint: コード品質のチェック
- Prisma 7: DB 操作
- PostgreSQL: ローカル DB
- Docker Compose: ローカル PostgreSQL 起動
- `@prisma/adapter-pg`: Prisma 7 の PostgreSQL adapter
- Auth.js / NextAuth (`next-auth@^5.0.0-beta.31`): GitHub OAuth のサインイン基盤
- `@auth/prisma-adapter@^2.11.2`: Auth.js と Prisma の接続
- Playwright: Chromium / WebKit の E2E テスト
- GitHub Actions: PostgreSQL service container を含む CI

`DATABASE_URL` は `prisma.config.ts` と `.env` で扱います。Prisma 7 前提のため、`schema.prisma` の `datasource` には `url = env("DATABASE_URL")` を書かない方針です。

OpenAI API などの AI API は、今後の候補です。

## 開発方針

このプロジェクトでは、実装前に目的と範囲を決め、段階的に作ります。

- まずは MVP の範囲を小さくする
- 実装済みの内容と予定を README で分けて書く
- 最初はモックデータで UI と情報設計を確認する
- DB は、画面とデータモデルの方針を固めてから追加する
- 認証は、demo user 固定で DB 操作を確認してから Auth.js / GitHub OAuth 基盤を追加する
- AI 機能は、就活データを十分に整理できる状態を作ってから追加する
- 大きな機能を一度に入れず、小さい変更単位で進める

AI は開発補助として使いますが、設計意図、実装範囲、優先順位は人が判断します。GitHub では、完成品だけでなく、なぜその順番で作るのかも見えるようにします。

## GitHub で見せたいポイント

このリポジトリでは、以下を伝えられる状態を目指します。

- 課題を自分の言葉で整理していること
- MVP の範囲を決めて、作りすぎを避けていること
- 実装前に README と docs で設計を残していること
- Next.js、TypeScript、Tailwind CSS を使った Web アプリ開発の流れ
- DB と Auth.js 基盤を追加済みで、AI 機能を段階的に追加する開発プロセス
- AI を使う場合も、丸投げではなく人が設計判断していること

## 現時点で未確定の判断

以下は今後の実装前に決める必要があります。InterviewLog 一覧画面は初期案では v1.0 候補でしたが、現在は未実装の今後検討事項として扱います。

- InterviewLog 一覧画面を後続フェーズでどう扱うか
- 検索・フィルター・ソートの優先度
- demo-user データ移行方針
- AI 機能で最初に実装するユースケース
- AI API に渡すデータの範囲と個人情報の扱い
- デプロイ先
- GitHub OAuth 実ログインなど外部サービスを含むテスト範囲
