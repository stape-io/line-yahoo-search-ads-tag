const computeEffectiveTldPlusOne = require('computeEffectiveTldPlusOne');
const getAllEventData = require('getAllEventData');
const getCookieValues = require('getCookieValues');
const getEventData = require('getEventData');
const getRequestHeader = require('getRequestHeader');
const getTimestampMillis = require('getTimestampMillis');
const getType = require('getType');
const JSON = require('JSON');
const logToConsole = require('logToConsole');
const makeInteger = require('makeInteger');
const makeNumber = require('makeNumber');
const makeString = require('makeString');
const Math = require('Math');
const parseUrl = require('parseUrl');
const sendHttpRequest = require('sendHttpRequest');
const setCookie = require('setCookie');

/*==============================================================================
==============================================================================*/

const eventData = getAllEventData();

if (shouldExitEarly(data, eventData)) return;

const mappedData = mapEvent(data, eventData);
setClickIdCookie(data, mappedData);

const invalidOrMissingFields = validateMappedData(data, mappedData);
if (invalidOrMissingFields) {
  log({
    Name: 'LineYahooSearchAdsCAPITag',
    Type: 'Message',
    EventName: 'Conversion',
    Message: '🛑 [ERROR] Request was not sent.',
    Reason: invalidOrMissingFields
  });

  return data.gtmOnFailure();
}

sendRequest(data, mappedData);

if (data.useOptimisticScenario) {
  return data.gtmOnSuccess();
}

/*==============================================================================
  Vendor related functions
==============================================================================*/

function setClickIdCookie(data, mappedData) {
  if (!data.setClickIdCookie) return;

  const hasYclid = !!mappedData.yclid;
  const hasSaParams = !!(mappedData.sa_p && mappedData.sa_t && mappedData.sa_ra);
  if (hasYclid || hasSaParams) {
    const cookieOptions = {
      domain: getCookieDomain(data.cookieDomain),
      samesite: data.cookieSameSite || 'None',
      path: '/',
      secure: true,
      httpOnly: !!data.cookieHttpOnly,
      'max-age': 60 * 60 * 24 * makeInteger(data.cookieExpiration || 90)
    };

    const cookieValue = JSON.stringify({
      yclid: mappedData.yclid,
      sa_p: mappedData.sa_p,
      sa_t: mappedData.sa_t,
      sa_ra: mappedData.sa_ra,
      sa_cc: mappedData.sa_cc
    });
    setCookie('_ly_sa_cids', cookieValue, cookieOptions, false);
  }
}

function addServerEventData(data, mappedData) {
  if (data.autoMapServerEventDataParameters) {
    mappedData.event_time = getTimestampMillis();
  }

  if (data.serverEventDataList) {
    data.serverEventDataList.forEach((d) => (mappedData[d.name] = d.value));
  }

  return mappedData;
}

function parseClickIdsFromUrl(eventData) {
  const url = eventData.page_location || eventData.page_referrer || getRequestHeader('referer');
  if (!url) return;

  const urlSearchParams = parseUrl(url).searchParams;
  return {
    yclid: urlSearchParams.yclid,
    sa_p: urlSearchParams.sa_p,
    sa_t: urlSearchParams.sa_t,
    sa_ra: urlSearchParams.sa_ra,
    sa_cc: urlSearchParams.sa_cc
  };
}

function getClickIds(eventData) {
  const clickIdsFromUrl = parseClickIdsFromUrl(eventData) || {};
  const clickIdsFromCookie = JSON.parse(getCookieValues('_ly_sa_cids')[0] || '{}');

  return {
    yclid: clickIdsFromUrl.yclid || clickIdsFromCookie.yclid || eventData.yclid,
    sa_p: clickIdsFromUrl.sa_p || clickIdsFromCookie.sa_p || eventData.sa_p,
    sa_t: clickIdsFromUrl.sa_t || clickIdsFromCookie.sa_t || eventData.sa_t,
    sa_ra: clickIdsFromUrl.sa_ra || clickIdsFromCookie.sa_ra || eventData.sa_ra,
    sa_cc: clickIdsFromUrl.sa_cc || clickIdsFromCookie.sa_cc || eventData.sa_cc
  };
}

function addUserIdentifiers(data, eventData, mappedData) {
  if (data.autoMapUserIdentifiersParameters) {
    if (eventData.ip_override) mappedData.ip = eventData.ip_override;
    if (eventData.user_agent) mappedData.user_agent = eventData.user_agent;

    const clickIds = getClickIds(eventData);
    ['yclid', 'sa_p', 'sa_t', 'sa_ra', 'sa_cc'].forEach((key) => {
      if (clickIds[key]) mappedData[key] = clickIds[key];
    });
  }

  if (data.userIdentifiersParametersList) {
    data.userIdentifiersParametersList.forEach((d) => (mappedData[d.name] = d.value));
  }

  return mappedData;
}

function addEventParameters(data, eventData, mappedData) {
  if (data.autoMapEventParameters) {
    let items;
    let valueFromItems;

    if (getType(eventData.items) === 'array' && eventData.items.length) items = eventData.items;
    else if (
      getType(eventData.ecommerce) === 'object' &&
      getType(eventData.ecommerce.items) === 'array' &&
      eventData.ecommerce.items.length
    ) {
      items = eventData.ecommerce.items;
    }

    if (getType(items) === 'array' && items.length) {
      valueFromItems = 0;
      items.forEach((i) => {
        if (isValidValue(i.price)) {
          const price = roundValue(i.price);
          if (isValidValue(price)) {
            const quantity = isValidValue(i.quantity) ? i.quantity : 1;
            valueFromItems += quantity * price;
          }
        }
      });
    }

    if (isValidValue(eventData.value)) {
      mappedData.yahoo_conversion_value = roundValue(eventData.value);
    } else if (isValidValue(valueFromItems)) {
      mappedData.yahoo_conversion_value = roundValue(valueFromItems);
    }
  }

  if (data.eventParametersList) {
    data.eventParametersList.forEach((d) => {
      if (d.name === 'yahoo_conversion_value' && isValidValue(d.value)) {
        d.value = roundValue(d.value);
      }
      mappedData[d.name] = d.value;
    });
  }

  return mappedData;
}

function addWebData(data, eventData, mappedData) {
  if (data.autoMapWebParameters) {
    if (eventData.page_location) mappedData.url = eventData.page_location;
    if (eventData.page_referrer) mappedData.referrer = eventData.page_referrer;
  }

  if (data.webParametersList) {
    data.webParametersList.forEach((d) => (mappedData[d.name] = d.value));
  }

  return mappedData;
}

function mapEvent(data, eventData) {
  const mappedData = {
    yahoo_conversion_id: data.conversionId ? makeString(data.conversionId) : undefined,
    yahoo_conversion_label: data.conversionLabel ? makeString(data.conversionLabel) : undefined
  };

  addServerEventData(data, mappedData);
  addUserIdentifiers(data, eventData, mappedData);
  addWebData(data, eventData, mappedData);
  addEventParameters(data, eventData, mappedData);

  return mappedData;
}

function validateMappedData(data, mappedData) {
  if (!data.appId) return 'Application ID (Client ID) is missing.';
  if (!mappedData.yahoo_conversion_id) return 'Yahoo Conversion ID is missing.';
  if (!mappedData.yahoo_conversion_label) return 'Yahoo Conversion Label is missing.';
  if (!mappedData.event_time) return 'Event time is missing.';
  if (!mappedData.url) return 'Page URL is missing.';
  if (!mappedData.user_agent) return 'User Agent is missing.';
  if (!mappedData.ip) return 'IP address is missing.';
  if (!mappedData.yclid && (!mappedData.sa_p || !mappedData.sa_t || !mappedData.sa_ra)) {
    return 'Click ID (yclid) or Search Ads parameters (sa_p, sa_t, sa_ra) are missing.';
  }
}

function generateRequestBaseUrl() {
  const version = 'v1';
  return 'https://search-ads-cv.yahooapis.jp/' + version + '/';
}

function generateRequestOptions(data) {
  const options = {
    method: 'POST',
    headers: {
      'User-Agent': 'Yahoo AppID: ' + data.appId,
      'Content-Type': 'application/json'
    }
  };

  return options;
}

function sendRequest(data, mappedData) {
  const requestUrl = generateRequestBaseUrl();
  const requestOptions = generateRequestOptions(data);
  return sendHttpRequest(requestUrl, requestOptions, JSON.stringify(mappedData))
    .then((result) => {
      if (result.statusCode >= 200 && result.statusCode < 300) {
        return !data.useOptimisticScenario ? data.gtmOnSuccess() : undefined;
      }
      return !data.useOptimisticScenario ? data.gtmOnFailure() : undefined;
    })
    .catch((result) => {
      return !data.useOptimisticScenario ? data.gtmOnFailure() : undefined;
    });
}

/*==============================================================================
  Helpers
==============================================================================*/

function getUrl(eventData) {
  return eventData.page_location || getRequestHeader('referer') || eventData.page_referrer;
}

function shouldExitEarly(data, eventData) {
  if (!isConsentGivenOrNotRequired(data, eventData)) {
    data.gtmOnSuccess();
    return true;
  }

  const url = getUrl(eventData);
  if (url && url.lastIndexOf('https://gtm-msr.appspot.com/', 0) === 0) {
    data.gtmOnSuccess();
    return true;
  }
}

function getCookieDomain(defaultCookieDomain) {
  return !defaultCookieDomain || defaultCookieDomain === 'auto'
    ? computeEffectiveTldPlusOne(getEventData('page_location') || getRequestHeader('referer')) ||
        'auto'
    : defaultCookieDomain;
}

function isValidValue(value) {
  const valueType = getType(value);
  return valueType !== 'null' && valueType !== 'undefined' && value !== '' && value === value;
}

function roundValue(value) {
  if (!value) return value;
  return Math.round(makeNumber(value) * 100) / 100;
}

function isConsentGivenOrNotRequired(data, eventData) {
  if (data.adStorageConsent !== 'required') return true;
  if (eventData.consent_state) return !!eventData.consent_state.ad_storage;
  const xGaGcs = eventData['x-ga-gcs'] || ''; // x-ga-gcs is a string like "G110"
  return xGaGcs[2] === '1';
}

function log(rawDataToLog) {
  rawDataToLog.TraceId = getRequestHeader('trace-id');
  logToConsole(JSON.stringify(rawDataToLog));
}
