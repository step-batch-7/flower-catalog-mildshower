const collectHeaders = function(collection, headerLine) {
  let [key, value] = headerLine.split(':');
  collection[key.trim()] = value.trim();
  return collection;
};

const collectKeyValue = function(keyValues, pair) {
  const [key, value] = pair.split('=');
  keyValues[key] = value;
  return keyValues;
};

const parseHeaders = function(headersText) {
  return headersText.reduce(collectHeaders, {});
};

const parseKeyValuePairs = function(keyValuePairs) {
  const pairs = keyValuePairs.split('&');
  return pairs.reduce(collectKeyValue, {});
};

const parseQuery = function(entireUrl) {
  const [url, queryString] = entireUrl.split('?');
  const query =
    queryString && queryString.split('&').reduce(collectKeyValue, {});
  return { url, query };
};

class Request {
  constructor(method, url, query, headers, body) {
    this.method = method;
    this.url = url;
    this.query = query;
    this.headers = headers;
    this.body = body;
    Object.freeze(this);
  }

  static parse(requestText) {
    const requestLines = requestText.split('\r\n');
    const emptyLineIndex = requestLines.indexOf('');
    let body = requestLines.slice(emptyLineIndex + 1).join('\n');
    const [firstLine, ...headersText] = requestLines.slice(0, emptyLineIndex);
    const [method, entireUrl, protocol] = firstLine.split(' ');
    let { url, query } = parseQuery(entireUrl);
    url = url === '/' ? '/index.html' : url;
    const headers = parseHeaders(headersText);
    if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      body = parseKeyValuePairs(body);
    }
    return new Request(method, url, query, headers, body);
  }

  getCookies() {
    if (!this.headers.Cookie) return {};
    const cookieKeyValues = this.headers.Cookie.split(' ;');
    return cookieKeyValues.reduce((cookies, pair) => {
      const [key, value] = pair.split('=');
      cookies[key] = value;
      return cookies;
    }, {});
  }
}

exports.Request = Request;
