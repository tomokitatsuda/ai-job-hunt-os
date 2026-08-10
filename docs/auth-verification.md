# Auth Verification

このドキュメントは、認証後の手動確認と Playwright E2E の確認範囲を整理するチェックリストです。

Auth.js / GitHub OAuth の導入後、通常動作では `getCurrentUserId()` が Auth.js の `auth()` から `session.user.id` を取得します。未ログイン時は主要画面から `/login` に redirect され、ログイン後に作成した Company / Task / InterviewLog はログインユーザーに紐づきます。

seed の `demo-user` は、過去データやローカル seed 確認用のユーザーとして残します。GitHub OAuth でログインした認証ユーザーとは別の `User` なので、ログイン直後に seed の Company / Task / InterviewLog が見えないのは、ユーザー分離が効いている正常な状態です。

## 確認済み項目

- 未ログインで `/`、`/companies`、`/tasks` などの主要画面へアクセスすると `/login` に redirect される
- `/login` から GitHub OAuth でログインできる
- ログイン後に Dashboard へ戻り、ログインユーザー用のデータが表示される
- サインアウト後、主要画面へアクセスすると再度 `/login` に redirect される
- ログイン後に Company を作成、表示、編集、削除できる
- ログイン後に Company 詳細画面内の Task を作成、完了/未完了切り替え、編集、削除できる
- ログイン後に Task 一覧画面で全 Task を未完了 / 完了に分けて確認できる
- ログイン後に Task 一覧画面で一般 Task と Company 紐づき Task を作成、編集、削除できる
- Task 編集時に Company の紐づけ変更と解除ができる
- ログイン後に Company 詳細画面内の InterviewLog を作成、表示、編集、削除できる
- Dashboard の応募企業数、未完了 Task 数、直近予定、選考ステータス別件数などがログインユーザーのデータで集計される
- Company と Task がない初回ユーザーにオンボーディングが表示される
- スターターデータ作成でサンプル Company 1 件、Company 紐づき Task 1 件、一般 Task 1 件が作られる
- データ作成後は初回オンボーディングが表示されなくなる
- seed の `demo-user` データと GitHub OAuth でログインしたユーザーのデータが混ざらない

## demo-user の扱い

- `demo-user` は seed / 過去データ用として残す
- `demo-user` のデータは、GitHub OAuth でログインした通常ユーザーへ自動移行しない
- ログイン直後に seed データが見えない場合は、owner scoping が効いている正常な状態として扱う
- demo-user データのログインユーザーへの移行方針は今後の検討事項とする

## 自動テストの範囲

`npm run test:e2e` は Chromium と WebKit で各9本、合計18本のテストを実行します。

- 未ログイン時の `/`、`/companies`、`/companies/new`、`/tasks` の redirect と callback URL
- `/login` の表示
- 初回オンボーディングとスターターデータ作成
- Company の作成・表示・編集・削除
- Task の作成・Company 紐づけ変更・完了切り替え・削除
- InterviewLog の作成・編集・削除

認証済みテストでは、テストごとに一時 User と Auth.js Session を DB に作り、ブラウザに `authjs.session-token` Cookie を設定します。アプリ本体の Auth.js と owner scoping を通り、終了時にはそのユーザーに属するデータを削除します。GitHub OAuth プロバイダーとの実ログイン完走は自動テストの対象外です。

GitHub Actions では専用の PostgreSQL service container にmigrationを適用し、lint、Prisma schema validation、production buildに続けて同じ18本を1 workerで実行します。ローカルの `npm run test:e2e` は通常の並列実行です。

## 秘密情報チェック

- `.env`、`.env.local`、実際の OAuth secret、個人用 DB の接続情報、API キーは commit しない
- `.env.example` には `AUTH_SECRET`、`AUTH_GITHUB_ID`、`AUTH_GITHUB_SECRET` のプレースホルダーのみを置く
- README / docs には OAuth secret や API key の実値を書かない
- 公開前に `git grep` で `AUTH_SECRET`、`AUTH_GITHUB_SECRET`、`sk-` 形式の API key らしき文字列が混入していないことを確認する

## まだ自動化していないこと

- GitHub OAuth プロバイダーとの実ログイン完走は自動化していない
- demo-user データのログインユーザーへの自動移行はまだ実装していない
