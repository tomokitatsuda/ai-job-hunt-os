# Auth Verification

このドキュメントは、v0.4.0 相当の認証後手動確認のチェックリストです。

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
- ログイン後に Task 一覧画面で一般 Task を作成、編集、削除できる
- ログイン後に Company 詳細画面内の InterviewLog を作成、表示、編集、削除できる
- Dashboard の応募企業数、未完了 Task 数、直近予定、選考ステータス別件数などがログインユーザーのデータで集計される
- seed の `demo-user` データと GitHub OAuth でログインしたユーザーのデータが混ざらない

## demo-user の扱い

- `demo-user` は seed / 過去データ用として残す
- `demo-user` のデータは、GitHub OAuth でログインした通常ユーザーへ自動移行しない
- ログイン直後に seed データが見えない場合は、owner scoping が効いている正常な状態として扱う
- demo-user データのログインユーザーへの移行方針や、初期データ作成フローは今後の検討事項とする

## 秘密情報チェック

- `.env`、`.env.local`、実際の OAuth secret、個人用 DB の接続情報、API キーは commit しない
- `.env.example` には `AUTH_SECRET`、`AUTH_GITHUB_ID`、`AUTH_GITHUB_SECRET` のプレースホルダーのみを置く
- README / docs には OAuth secret や API key の実値を書かない
- 公開前に `git grep` で `AUTH_SECRET`、`AUTH_GITHUB_SECRET`、`sk-` 形式の API key らしき文字列が混入していないことを確認する

## まだ自動化していないこと

- このチェックリストは手動確認ベースであり、本格的な自動テストはまだ整備していない
- middleware/proxy による包括的な全画面保護はまだ実装していない
- demo-user データのログインユーザーへの自動移行はまだ実装していない
- 初期データ作成フローはまだ実装していない
