# LINE Yahoo Conversion API タグ（Search Ads）（Google タグ マネージャー サーバーサイド）

> 🇺🇸 [English version here](README.md)

**LINE Yahoo Conversion API タグ（Search Ads）**（Google タグ マネージャー サーバーサイド）は、GTM サーバーコンテナからコンバージョンイベントデータを [LINE Yahoo Search Ads Conversion API](https://github.com/yahoojp-marketing/search-ads-conversion-api-documents/blob/main/docs_ja/conversion-api.md) へ直接送信するタグです。このサーバー間連携により、クリックパラメータのみの実装と比較して、より信頼性が高くプライバシーに配慮したコンバージョン計測が可能になります。

> **注意:** このタグは **Search Ads** 向けの Conversion API です。
> **Display Ads** 向けをご利用の場合は、[LINE Yahoo Conversion API タグ（Display Ads）](https://github.com/stape-io/line-yahoo-tag)をご参照ください。

## 機能

- **サーバー間イベント送信**: GTM サーバーコンテナから LINE Yahoo Search Ads Conversion API へ直接コンバージョンデータを送信します。
- **自動データマッピング**: サーバーイベントデータ、ユーザー識別子、Web パラメータ、イベントパラメータを受信した GTM イベントデータから自動的にマッピングします。
- **Click ID Cookie 管理**: `_ly_sa_cids` Cookie をサーバーサイドで読み取り・設定し、`yclid` Click ID や `sa_p` / `sa_t` / `sa_ra` / `sa_cc` Search Ads Click Parameters を保存することで、リクエスト間のアトリビューション精度を向上させます。
- **柔軟な Click ID 取得**: URL クエリパラメータ、`_ly_sa_cids` Cookie、イベントデータの優先順位で Click ID を解決します。
- **コンセントモード対応**: Google コンセントモードと連携し、データ送信前に `ad_storage` の同意を確認します。
- **楽観的シナリオ**: 有効にすると、API レスポンスを待たずに即座に `gtmOnSuccess()` を呼び出し、サーバーのレスポンス時間を短縮できます。

## 仕組み

このタグは、広告クリック時に取得した `yclid` Click ID または `sa_p` / `sa_t` / `sa_ra` Search Ads Click Parameters を使用してコンバージョンをアトリビュートし、GTM サーバーコンテナから LINE Yahoo Search Ads Conversion API へ直接コンバージョンイベントを送信します。

## インストール

1. **テンプレートのダウンロード**：
   - 本リポジトリから `template.tpl` ファイルをダウンロードします。
2. **GTM サーバーコンテナへのインポート**：
   - GTM サーバーコンテナで、**テンプレート**セクションに移動します。
   - **タグテンプレート**セクションの**新規**をクリックします。
   - 右上の**縦三点リーダーメニュー**をクリックし、**インポート**を選択します。
   - ダウンロードした `template.tpl` ファイルを選択し、**保存**をクリックします。
3. **新規タグの作成**：
   - **タグ**に移動し、**新規**をクリックします。
   - インポートした **LINE Yahoo Conversion API Tag / Conversion APIタグ（LINEヤフー）for Search Ads by Stape** テンプレートを選択します。

## タグ設定

### 基本設定

| パラメータ | 説明 |
| :--- | :--- |
| **アプリケーションID（Client ID）** | Yahoo!デベロッパーネットワークで発行された、アプリケーションを識別するアプリケーションID（Client ID）。各リクエストの送信時に必須です。 |
| **Yahoo Conversion ID** | コンバージョン設定の `yahoo_conversion_id`。 |
| **Yahoo Conversion Label** | コンバージョン設定の `yahoo_conversion_label`。 |
| **楽観的シナリオを使用する** | 有効にすると、API レスポンスを待たずに即座に `gtmOnSuccess()` を呼び出し、サーバーのレスポンス時間を短縮します。 |

### Click ID設定

`yclid` Click ID や `sa_p` / `sa_t` / `sa_ra` / `sa_cc` Search Ads Click Parameters を保存する `_ly_sa_cids` Cookie の取り扱いを制御します。

| パラメータ | 説明 |
| :--- | :--- |
| **Click ID Cookieを設定する** | `true` の場合、取得された Click ID / Search Ads Click Parameters がサーバー GTM によって `_ly_sa_cids` Cookie に保存されます。`false` の場合、それらはリクエストで送信されますが、Cookie には保存されません。 |

#### Cookie設定

| パラメータ | 説明 |
| :--- | :--- |
| **Cookieドメイン** | Cookie のドメイン。空欄または `auto` の場合、`page_location` イベントデータパラメータ、`Referer` / `Forwarded` / `X-Forwarded-Host` / `Host` ヘッダーの順で自動的にドメインが決定されます。 |
| **Cookie SameSite** | Cookie の `SameSite` 属性：`None`、`Lax`、または `Strict`。 |
| **Cookie HttpOnly フラグ** | `true` の場合、クライアントサイドの JavaScript から Cookie へのアクセスを禁止します。 |
| **Cookie 有効期限** | Cookie の有効期限（日数）。デフォルトは `90` 日です。 |

`yclid` Click ID および Search Ads Click Parameters（`sa_p`、`sa_t`、`sa_ra`、`sa_cc`）は、それぞれ以下の優先順位で取得されます：
1. **ユーザー識別子パラメータ**セクション（手動上書き）
2. URL クエリパラメータ（例：`yclid`、`sa_p`）
3. `_ly_sa_cids` Cookie
4. イベントデータパラメータ（例：`eventData.yclid`、`eventData.sa_p`）

### サーバーイベントデータパラメータ

| パラメータ | 説明 |
| :--- | :--- |
| **サーバーイベントデータパラメータを自動マッピングする** | 有効にすると、`Event Timestamp` をサーバータグ起動時のミリ秒単位の Unix タイムスタンプに自動設定します。 |
| **サーバーイベントデータパラメータ** | `Event Timestamp` を手動で上書きまたは追加できます。 |

### ユーザー識別子パラメータ

少なくとも 1 つの **IP Address** と **User Agent**（自動マッピングまたは手動入力のいずれか）、および少なくとも `yclid` Click ID、または `sa_p` + `sa_t` + `sa_ra`（`sa_cc` は任意）のすべて（自動マッピングまたは手動入力のいずれか）が必須です。各パラメータの詳細は [Conversion API ドキュメント](https://github.com/yahoojp-marketing/search-ads-conversion-api-documents/blob/main/docs_ja/conversion-api.md)をご参照ください。

| パラメータ | 説明 |
| :--- | :--- |
| **ユーザー識別子パラメータを自動マッピングする** | 有効にすると、URL クエリパラメータ、`_ly_sa_cids` Cookie、またはイベントデータから `User Agent`、`IP Address`、および `yclid` Click ID / `sa_p` / `sa_t` / `sa_ra` / `sa_cc` Search Ads Click Parameters を自動マッピングします。 |
| **ユーザー識別子パラメータ** | `IP Address`、`User Agent`、`yclid Ad Click ID`、`sa_p Ad Click Parameter`、`sa_t Ad Click Parameter`、`sa_ra Ad Click Parameter`、`sa_cc Ad Click Parameter` を手動で指定します。 |

`yclid`、`sa_p`、`sa_t`、`sa_ra`、`sa_cc` は、広告クリック後のランディングページの URL クエリパラメータに含まれます（例：`https://example.com/?yclid=YSS.1234567890.Ab12CdEfGhIJ345kLm_N_oPq&sa_p=YSA&sa_cc=1234567890&sa_t=1754368953900&sa_ra=A1`）。

### Webパラメータ

各パラメータの詳細は [Conversion API ドキュメント](https://github.com/yahoojp-marketing/search-ads-conversion-api-documents/blob/main/docs_ja/conversion-api.md)をご参照ください。

| パラメータ | 説明 |
| :--- | :--- |
| **Webパラメータを自動マッピングする** | 有効にすると、`eventData.page_location` から `Page URL` を、`eventData.page_referrer` から `Page Referrer URL` を自動マッピングします。 |
| **Webパラメータ** | `Page URL` と `Page Referrer URL` を手動で指定します。**Page URL** は、自動マッピングまたは手動入力のいずれかで必須です。 |

### イベントパラメータ

各パラメータの詳細は [Conversion API ドキュメント](https://github.com/yahoojp-marketing/search-ads-conversion-api-documents/blob/main/docs_ja/conversion-api.md)をご参照ください。

| パラメータ | 説明 |
| :--- | :--- |
| **イベントパラメータを自動マッピングする** | 有効にすると、`eventData.value` から `Conversion Value` を自動マッピングし、存在しない場合は `eventData.items`（または `eventData.ecommerce.items`）の `Price * Quantity` の合計にフォールバックします。 |
| **イベントパラメータ** | `Conversion Value` を手動で指定します。 |

### 詳細設定

#### タグ実行同意設定

| パラメータ | 説明 |
| :--- | :--- |
| **Ad Storage 同意** | `常にデータを送信する`（デフォルト）または `マーケティング同意が得られた場合にデータを送信する`。後者は `ad_storage` 同意（Google コンセントモードまたは Stape の Data タグパラメータ）が得られていない場合、タグの実行を中断します。 |

## 参考リソース

- [Conversion API ドキュメント](https://github.com/yahoojp-marketing/search-ads-conversion-api-documents/blob/main/docs_ja/conversion-api.md)
- [Conversion API 概要](https://ads-help.yahoo-net.jp/s/article/H000055709?language=ja)
- [コンバージョンの作成方法](https://ads-help.yahoo-net.jp/s/article/H000046007?language=ja)
- [コンバージョンの確認方法](https://ads-help.yahoo-net.jp/s/article/H000044958?language=ja)
- [アプリケーションID（Client ID）について](https://support.yahoo-net.jp/PccDeveloper/s/article/H000006122)
- [ステップバイステップ：アプリケーションIDの取得方法](https://developer.yahoo.co.jp/start/)

## オープンソース

**LINE Yahoo Conversion API タグ（Search Ads）（GTM サーバーサイド）**は、Apache 2.0 ライセンスのもと [Stape チーム](https://stape.io/)によって開発・メンテナンスされています。
