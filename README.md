# LINE Yahoo Conversion API Tag (Search Ads) for Google Tag Manager Server-Side

> 🇯🇵 [日本語版はこちら](README.ja.md)

The **LINE Yahoo Conversion API Tag (Search Ads)** for Google Tag Manager Server-Side allows you to send conversion event data from your server container directly to the [LINE Yahoo Search Ads Conversion API](https://github.com/yahoojp-marketing/search-ads-conversion-api-documents/blob/main/docs_en/conversion-api.md). This server-to-server integration provides a more reliable and privacy-compliant way to track conversions compared to click-parameter-only setups.

> **Note:** This tag is for **Search Ads** Conversion API.
> For the **Display Ads** version, please refer to the [LINE Yahoo Conversion API Tag (Display Ads)](https://github.com/stape-io/line-yahoo-tag).

## Features

- **Server-to-Server Events**: Sends conversion data directly from the GTM Server Container to the LINE Yahoo Search Ads Conversion API.
- **Automatic Data Mapping**: Intelligently maps parameters from incoming GTM event data for server event data, user identifiers, web parameters, and event parameters.
- **Click ID Cookie Management**: Automatically reads and sets the `_ly_sa_cids` cookie server-side, storing the `yclid` Click ID and/or the `sa_p` / `sa_t` / `sa_ra` / `sa_cc` Search Ads Click Parameters to improve attribution across requests.
- **Flexible Click ID Sourcing**: Resolves Click IDs from the URL query parameters, the `_ly_sa_cids` cookie, or the Event Data, in that priority order.
- **Consent Mode Support**: Integrates with Google Consent Mode, checking for `ad_storage` consent before sending data.
- **Optimistic Scenario**: Optionally fires `gtmOnSuccess()` immediately without waiting for the API response, to speed up server response time.

## How It Works

This tag sends conversion events directly from your GTM Server Container to the LINE Yahoo Search Ads Conversion API, using the `yclid` Click ID or the `sa_p` / `sa_t` / `sa_ra` Search Ads Click Parameters captured from the ad click to attribute the conversion.

## Installation

1. **Download the Template**:
   - Download the `template.tpl` file from this repository.
2. **Import to GTM Server Container**:
   - In your GTM Server Container, navigate to the **Templates** section.
   - Click **New** under the **Tag Templates** section.
   - Click the **three-dot menu** in the top right and select **Import**.
   - Select the downloaded `template.tpl` file and click **Save**.
3. **Create a New Tag**:
   - Go to **Tags** and click **New**.
   - Select the newly imported **LINE Yahoo Conversion API Tag / Conversion APIタグ（LINEヤフー）for Search Ads by Stape** template.

## Tag Configuration

### Base Configuration

| Parameter | Description |
| :--- | :--- |
| **Application ID (Client ID)** | The Application ID (Client ID) that identifies your application, issued on the Yahoo! Developer Network. Required with every request. |
| **Yahoo Conversion ID** | The `yahoo_conversion_id` from your conversion setting. |
| **Yahoo Conversion Label** | The `yahoo_conversion_label` from your conversion setting. |
| **Use Optimistic Scenario** | If enabled, the tag fires `gtmOnSuccess()` immediately without waiting for the API response, speeding up server response time. |

### Click ID Settings

Controls how the tag handles the `_ly_sa_cids` cookie, which stores the `yclid` Click ID and the `sa_p` / `sa_t` / `sa_ra` / `sa_cc` Search Ads Click Parameters.

| Parameter | Description |
| :--- | :--- |
| **Set Click ID cookie** | If `true`, the resolved Click ID / Search Ads Click Parameters are stored in the `_ly_sa_cids` cookie by server GTM. If `false`, they are still sent in the request but not stored as a cookie. |

#### Cookie Settings

| Parameter | Description |
| :--- | :--- |
| **Cookie Domain** | The cookie domain. Leave empty or use `auto` to automatically determine the domain from the `page_location` Event Data parameter, the `Referer`/`Forwarded`/`X-Forwarded-Host`/`Host` headers, in that priority order. |
| **Cookie SameSite** | The `SameSite` attribute of the cookie: `None`, `Lax`, or `Strict`. |
| **Cookie HTTP Only Flag** | If `true`, forbids client-side JavaScript from accessing the cookie. |
| **Cookie Expiration** | The cookie lifetime, in days. Defaults to `90`. |

The `yclid` Click ID and Search Ads Click Parameters (`sa_p`, `sa_t`, `sa_ra`, `sa_cc`) are each sourced in the following priority order:
1. **User Identifiers Parameters** section (manual override)
2. URL query parameter (e.g. `yclid`, `sa_p`)
3. `_ly_sa_cids` cookie
4. Event Data parameter (e.g. `eventData.yclid`, `eventData.sa_p`)

### Server Event Data Parameters

| Parameter | Description |
| :--- | :--- |
| **Automap Server Event Data Parameters** | If enabled, automatically sets the `Event Timestamp` to the Unix timestamp (in milliseconds) of when the server tag fired. |
| **Server Event Data Parameters** | Manually override or add the `Event Timestamp`. |

### User Identifiers Parameters

At least one **IP Address** and **User Agent** are required (either auto-mapped or manual), and at least the `yclid` Click ID, or all of `sa_p` + `sa_t` + `sa_ra` (`sa_cc` is optional), are required (either auto-mapped or manual). For full parameter descriptions, see the [Conversion API documentation](https://github.com/yahoojp-marketing/search-ads-conversion-api-documents/blob/main/docs_en/conversion-api.md).

| Parameter | Description |
| :--- | :--- |
| **Automap User Identifiers Parameters** | If enabled, automatically maps `User Agent`, `IP Address`, and the `yclid` Click ID / `sa_p` / `sa_t` / `sa_ra` / `sa_cc` Search Ads Click Parameters from the URL query parameters, the `_ly_sa_cids` cookie, or the Event Data. |
| **User Identifiers Parameters** | Manually specify `IP Address`, `User Agent`, `yclid Ad Click ID`, `sa_p Ad Click Parameter`, `sa_t Ad Click Parameter`, `sa_ra Ad Click Parameter`, and `sa_cc Ad Click Parameter`. |

`yclid`, `sa_p`, `sa_t`, `sa_ra`, and `sa_cc` are present in the URL query parameters of the landing page after an ad click (e.g. `https://example.com/?yclid=YSS.1234567890.Ab12CdEfGhIJ345kLm_N_oPq&sa_p=YSA&sa_cc=1234567890&sa_t=1754368953900&sa_ra=A1`).

### Web Parameters

For full parameter descriptions, see the [Conversion API documentation](https://github.com/yahoojp-marketing/search-ads-conversion-api-documents/blob/main/docs_en/conversion-api.md).

| Parameter | Description |
| :--- | :--- |
| **Automap Web Parameters** | If enabled, automatically maps `Page URL` from `eventData.page_location` and `Page Referrer URL` from `eventData.page_referrer`. |
| **Web Parameters** | Manually specify `Page URL` and `Page Referrer URL`. **Page URL** is required, either auto-mapped or manual. |

### Event Parameters

For full parameter descriptions, see the [Conversion API documentation](https://github.com/yahoojp-marketing/search-ads-conversion-api-documents/blob/main/docs_en/conversion-api.md).

| Parameter | Description |
| :--- | :--- |
| **Automap Event Parameters** | If enabled, automatically maps `Conversion Value` from `eventData.value`, or falls back to the sum of `eventData.items` (or `eventData.ecommerce.items`) `Price * Quantity`. |
| **Event Parameters** | Manually specify `Conversion Value`. |

### Advanced Settings

#### Tag Execution Consent Settings

| Parameter | Description |
| :--- | :--- |
| **Ad Storage Consent** | `Send data always` (default) or `Send data in case marketing consent given`. The latter aborts the tag if `ad_storage` consent (Google Consent Mode or Stape's Data Tag parameter) is not granted. |

## Useful Resources

- [Conversion API Documentation](https://github.com/yahoojp-marketing/search-ads-conversion-api-documents/blob/main/docs_en/conversion-api.md)
- [Conversion API Overview](https://ads-help.yahoo-net.jp/s/article/H000055709?language=en_US)
- [How to Create a Conversion](https://ads-help.yahoo-net.jp/s/article/H000046007?language=en_US)
- [Checking the Conversion](https://ads-help.yahoo-net.jp/s/article/H000044958?language=en_US)
- [About the Application ID (Client ID)](https://support.yahoo-net.jp/PccDeveloper/s/article/H000006122) (Japanese only)
- [Step by step: obtaining an Application ID](https://developer.yahoo.co.jp/start/) (Japanese only)

## Open Source

The **LINE Yahoo Conversion API Tag (Search Ads) for GTM Server-Side** is developed and maintained by the [Stape Team](https://stape.io/) under the Apache 2.0 license.

### GTM Gallery Status
🔴 Not listed
