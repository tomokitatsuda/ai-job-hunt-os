# AI Job Hunt OS Deployment Guide

このドキュメントは、AI Job Hunt OS をコンテナ対応のホスティング環境へ公開するための共通手順です。特定のproviderはまだ選んでいないため、今回は「同じimageをstaging／productionへ昇格できる状態」までを対象にしています。

## 配備構成

本番環境では次の3要素を用意します。

- `Dockerfile` の `runner` targetから作るNext.js application image
- `Dockerfile` の `migration` targetから作るPrisma migration image
- applicationとは別に管理するPostgreSQL database

application imageはNext.jsの`output: "standalone"`を使い、実行に必要なfileだけを含めます。`scripts/prepare-standalone.mjs`が`public`と`.next/static`もstandalone出力へコピーします。最終imageはrootではなくNode公式imageの`node` userで動き、現在のlocal buildでは約98 MBです。

本番DBをapplication containerに同居させないでください。managed PostgreSQLなど、backup、暗号化、接続制御を提供するdatabaseを使います。

## 配備先に必要な機能

- Linux container imageをbuildまたはregistryから実行できる
- PostgreSQLへ接続できる
- secretをbuild時ではなくruntimeに注入できる
- HTTPS endpointと独自domainを設定できる
- release時に一度だけmigration jobを実行できる
- liveness／readiness probe、application log、rollbackを扱える

Next.js serverをinternetへ直接公開せず、hosting providerのload balancerやreverse proxyを前段に置きます。最初はapplication 1 instanceで運用し、複数instance化はtrafficの必要性が出てから検討します。

## 本番環境変数

次の値をhosting providerのsecret managerへ登録します。実値をrepository、Dockerfile、build argument、CI logへ残してはいけません。

| 変数 | 用途 |
| --- | --- |
| `DATABASE_URL` | 本番PostgreSQLの接続URL。provider指定のTLS設定も含める |
| `AUTH_SECRET` | Auth.jsのcookie／token署名に使う十分に長いrandom secret |
| `AUTH_GITHUB_ID` | production用GitHub OAuth AppのClient ID |
| `AUTH_GITHUB_SECRET` | production用GitHub OAuth AppのClient secret |
| `AUTH_TRUST_HOST` | trusted reverse proxy配下で`true`にする |
| `AUTH_URL` | 必要なproviderでは公開origin（例: `https://jobs.example.com`）を明示する |

`AUTH_SECRET`の候補はlocal端末で次のように生成できます。生成結果そのものはcommitしません。

```bash
openssl rand -base64 32
```

`AUTH_TRUST_HOST=true`は、hosting providerが外部から渡されたHost headerを適切に検証・上書きする場合だけ設定します。

## GitHub OAuth設定

GitHubではlocal用とは別にproduction用OAuth Appを作ると、secretやcallback URLを環境ごとに分離できます。

- Homepage URL: `https://<production-domain>`
- Authorization callback URL: `https://<production-domain>/api/auth/callback/github`

domainを変更した場合は、GitHub側のcallback URLとapplication側の公開URL設定を同時に見直します。

## Imageをbuildする

repository rootで、同じcommitから2つのtargetをbuildします。

```bash
docker build --target migration --tag ai-job-hunt-os-migration:<git-sha> .
docker build --target runner --tag ai-job-hunt-os:<git-sha> .
```

- `migration` imageはPrisma CLIとmigration fileを含みます。
- `runner` imageはstandalone serverだけを含む小さいproduction imageです。
- `.dockerignore`が`.env*`、test report、local build、Git metadataをbuild contextから除外します。
- buildにはplaceholder値だけを使い、本番secretはruntimeに注入します。

registryへpushする場合は、可変tagだけでなくcommit SHAやimage digestを記録してください。rollback時に同じartifactを再利用できます。

## Release順序

releaseは次の順で行います。

1. production DBのbackup／復元手順を確認する
2. 新しいcommitからmigration imageとrunner imageをbuildする
3. migration imageを一度だけ実行する
4. migration成功後にrunner imageを配備する
5. readiness、主要画面、GitHub loginを確認する

localで手順を再現するときは、gitignoredの`.env.production`へruntime値を置き、次のように実行できます。

```bash
docker run --rm --env-file .env.production ai-job-hunt-os-migration:<git-sha>
docker run --detach --name ai-job-hunt-os --publish 3000:3000 --env-file .env.production ai-job-hunt-os:<git-sha>
```

productionでは上記fileをserverへ配置せず、providerのsecret managerとrelease jobを使います。seedは開発fixtureなので本番では実行しません。

## Health check

認証不要の2 endpointを用意しています。どちらもsecretや個人情報を返さず、cacheされません。

| Endpoint | 成功 | 確認内容 | 主な用途 |
| --- | --- | --- | --- |
| `/api/health/live` | `200 {"status":"ok"}` | Next.js processがHTTPへ応答できる | liveness／再起動判定 |
| `/api/health/ready` | `200`、DB不通時`503` | `SELECT 1`によるPostgreSQL疎通 | traffic受付／release確認 |

Dockerfileの`HEALTHCHECK`はreadiness endpointを使います。外部monitoringでは両者の役割を分け、DB障害だけでcontainerを無限に再起動しない設定を推奨します。

```bash
curl --fail https://<production-domain>/api/health/live
curl --fail https://<production-domain>/api/health/ready
```

## CIで保証する内容

GitHub Actionsはdependency audit、migration、lint、schema validation、unit test、build、Playwrightに加えて次を検証します。

- migration／runner targetのDocker build
- migration imageからの`prisma migrate deploy`
- runner imageがnon-rootの`node` userであること
- runner imageへ`.env`が混入していないこと
- 実containerからreadiness／liveness endpointが成功すること

CI成功は外部OAuthやproduction networkまで保証しません。初回公開時はproduction checklistを別途実施します。

## 公開前checklist

- [ ] production用PostgreSQLとbackup／restore手順がある
- [ ] 全runtime secretをproviderのsecret managerへ登録した
- [ ] production用GitHub OAuth callback URLを登録した
- [ ] HTTPSとdomainを設定した
- [ ] migration jobが成功した
- [ ] `/api/health/live`と`/api/health/ready`が成功した
- [ ] GitHub login／logoutを実ブラウザで確認した
- [ ] 初回onboardingと主要CRUDをproduction相当環境で確認した
- [ ] application／database logの保存先とalertを確認した
- [ ] 直前のrunner image tagまたはdigestをrollback用に記録した

## Rollback

applicationに問題があれば、直前のrunner imageへ戻します。migrationは自動で巻き戻しません。DB schema変更を含むreleaseでは、旧applicationと新schemaが同時に動ける後方互換なmigrationを基本にします。破壊的変更が必要な場合は、data移行とrollback手順をrelease前に個別設計します。

## 今回の到達点と次の作業

このrepository単体では、provider共通のimage、migration、health check、CI smoke testまで準備済みです。実公開には次の判断が残っています。

1. hosting providerとmanaged PostgreSQLを選ぶ
2. staging環境でimageを配備する
3. domain、GitHub OAuth、secret、monitoringを設定する
4. staging確認後にproductionへ同じimageを昇格する
