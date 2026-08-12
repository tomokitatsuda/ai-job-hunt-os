# AI Job Hunt OS Deployment Guide

このドキュメントは、AI Job Hunt OS をstagingへ公開し、同じcontainer imageを将来productionへ昇格するための手順です。

## 選定したprovider

stagingは次の組み合わせにします。

| 役割 | Provider | 選定理由 |
| --- | --- | --- |
| Web hosting | Render Web Service | GHCRのprebuilt imageとdigestを直接配備でき、Singapore region、HTTPS、health check、deploy hook、無料Web Serviceを利用できる |
| Managed PostgreSQL | Neon | 無料枠に期限がなく、time travel、multi-AZ storage、autoscaling、monitoring、PgBouncer接続を含むmanaged PostgreSQLを利用できる |
| Container registry / CD | GitHub Container Registry / GitHub Actions | sourceとimageの権限をGitHubへ集約し、commit SHAとdigestで再現可能な手動releaseを作れる |

Render自身の無料PostgreSQLは30日で期限切れになりbackupもないため、継続利用するstaging DBには採用しません。RailwayのPostgreSQL templateは公式にもunmanagedと説明されており、今回の「managed PostgreSQL」という要件から外れます。Fly Managed Postgresも要件を満たしますが、学習用stagingには最低費用が大きいため見送りました。

Render Free Web ServiceとNeon Freeは、inactive時のsleep／scale-to-zeroによる初回応答の遅延があります。常時稼働やSLAが必要なproductionへ進むときはpaid planを再評価してください。

## 配備構成

配備環境では次の3要素を用意します。

- `Dockerfile` の `runner` targetから作るNext.js application image
- `Dockerfile` の `migration` targetから作るPrisma migration image
- applicationとは別に管理するPostgreSQL database

application imageはNext.jsの`output: "standalone"`を使い、実行に必要なfileだけを含めます。`scripts/prepare-standalone.mjs`が`public`と`.next/static`もstandalone出力へコピーします。最終imageはrootではなくNode公式imageの`node` userで動き、現在のlocal buildでは約98 MBです。

DBをapplication containerに同居させません。stagingではRender SingaporeとNeon Singapore（AWS `ap-southeast-1`）をそろえ、region間latencyを抑えます。

staging releaseは次の順で進みます。

```text
CI成功済みcommit
  ├─ runner target ───> GHCR :<commit-sha> ─┐
  └─ migration target -> GHCR :<commit-sha> ├─> Prisma migrate deploy
                                             └─> runnerを:stagingへ昇格
                                                  └─> Renderへ同じdigestを指定
                                                       └─> revision + readiness確認
```

`staging` tagは操作しやすい入口ですが、Renderへのreleaseと検証にはimmutableなdigestを使います。migration失敗時はtag昇格もRender deployも行いません。

## Stagingの初回bootstrap

外部サービスの秘密値はcommitしません。次の手順は各consoleで一度だけ実施します。

### 1. Neon projectを作る

1. Neon Freeで`ai-job-hunt-os-staging` projectを作る
2. regionをSingapore（AWS `ap-southeast-1`）にする
3. Connect画面からpooled URLとdirect URLを取得する
4. pooled URLはRenderの`DATABASE_URL`用、direct URLはGitHub Actionsのmigration用として分ける

hostnameに`-pooler`を含むURLがpooled接続です。Prisma migrationはschema変更を確実に行えるdirect接続、常駐applicationは接続数を抑えられるpooled接続を使います。どちらもproviderが示すTLS parameterを削除しないでください。

### 2. GitHubのstaging Environmentを作る

repositoryのSettings → Environmentsで`staging`を作成し、次を登録します。

| 種別 | 名前 | 値 |
| --- | --- | --- |
| Environment secret | `STAGING_DIRECT_DATABASE_URL` | Neonのdirect接続URL |
| Environment secret | `RENDER_STAGING_DEPLOY_HOOK_URL` | Render service作成後にSettingsから取得。bootstrap時は未登録でよい |
| Environment variable | `STAGING_BASE_URL` | Renderの公開origin。bootstrap時は未登録でよい |

`staging`にRequired reviewersを設定すると、DB migrationとdeployの直前に承認を挟めます。

### 3. 最初のimageを発行してDBをmigrationする

mainのCI成功後、Actions → Deploy staging → Run workflowで`deploy_render=false`を選びます。この初回runは次を行います。

1. CIが同じcommit SHAで成功済みか確認
2. `linux/amd64`のrunner／migration imageを並列build
3. commit SHA tagでGHCRへpush
4. migration imageをdigest指定で実行
5. 成功したrunner imageだけを`staging` tagへ昇格

初回publish後、GitHub Packagesの`ai-job-hunt-os` runner packageをpublicにします。repository自体がpublicでimageにsecretを含めないため、Render用の長期PATを増やさずに済みます。migration packageはRenderからpullしないためprivateのままで構いません。runner packageをprivateにする場合は、代わりにRenderへ`read:packages`だけを持つGHCR credentialを登録し、`render.yaml`の`image.creds`へ関連付けてください。

### 4. GitHub OAuth Appを作る

staging専用のGitHub OAuth Appを作成します。想定URLは次です。

- Homepage URL: `https://ai-job-hunt-os-staging-tomokitatsuda.onrender.com`
- Authorization callback URL: `https://ai-job-hunt-os-staging-tomokitatsuda.onrender.com/api/auth/callback/github`

Renderが異なるsubdomainを割り当てた場合は、実URLに合わせてOAuth Appを更新します。productionでは別のOAuth Appを使ってsecretとcallbackを分離します。

### 5. Render Blueprintを作る

Render DashboardのNew → Blueprintからこのrepositoryの`render.yaml`を同期します。Blueprintは次を固定します。

- prebuilt image: `ghcr.io/tomokitatsuda/ai-job-hunt-os:staging`
- plan: Free
- region: Singapore
- health check: `/api/health/ready`
- instance: 1

作成画面で`sync: false`の値を入力します。

| Render環境変数 | 値 |
| --- | --- |
| `DATABASE_URL` | Neonのpooled接続URL |
| `AUTH_GITHUB_ID` | staging OAuth AppのClient ID |
| `AUTH_GITHUB_SECRET` | staging OAuth AppのClient secret |

`AUTH_SECRET`はBlueprintの`generateValue: true`でRenderが生成します。`AUTH_TRUST_HOST=true`もBlueprintで設定します。

### 6. 継続deployを有効にする

Render serviceのSettingsでDeploy Hook URLを取得し、GitHubの`staging` Environmentへ次を追加します。

- secret `RENDER_STAGING_DEPLOY_HOOK_URL`
- variable `STAGING_BASE_URL`（末尾slashなし）

以後は`deploy_render=true`でDeploy staging workflowを実行します。workflowはmigration後、deploy hookの`imgURL`へrunnerのdigestをURL encodeして渡します。最大10分間、`/api/health/live`のrevisionが対象commit SHAになるのを待ち、その後`/api/health/ready`でDB接続まで確認します。

## 配備先に必要な機能

- Linux container imageをbuildまたはregistryから実行できる
- PostgreSQLへ接続できる
- secretをbuild時ではなくruntimeに注入できる
- HTTPS endpointと独自domainを設定できる
- release時に一度だけmigration jobを実行できる
- liveness／readiness probe、application log、rollbackを扱える

Next.js serverをinternetへ直接公開せず、hosting providerのload balancerやreverse proxyを前段に置きます。最初はapplication 1 instanceで運用し、複数instance化はtrafficの必要性が出てから検討します。

## Runtime環境変数

次の値をhosting providerのsecret managerへ登録します。実値をrepository、Dockerfile、build argument、CI logへ残してはいけません。

| 変数 | 用途 |
| --- | --- |
| `DATABASE_URL` | PostgreSQLのpooled接続URL。provider指定のTLS設定も含める |
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

GitHubではlocal／staging／production用のOAuth Appを分けると、secretやcallback URLを環境ごとに分離できます。

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
| `/api/health/live` | `200`、`status`と`revision` | Next.js processと配備commitが確認できる | liveness／release検証 |
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

## 現在の到達点と次の作業

provider選定、Render Blueprint、GHCR publish、staging migration、digest deploy、release検証のworkflowまでrepositoryに準備済みです。外部consoleで初回bootstrapを完了すると、同じworkflowからstagingを反復配備できます。

次はstagingでGitHub login、初回onboarding、主要CRUDを手動確認します。その後、monitoringとproduction用domain／OAuth／secretを用意し、stagingで検証したrunner digestをbuildし直さずproductionへ昇格します。
