const collectHeaders = function(collection, headerLine) {
  const [key, value] = headerLine.split(':');
  collection[key.trim()] = value.trim();
  return collection;
};

const parseHeaders = function(headersText) {
  return headersText.reduce(collectHeaders, {});
};

const collectKeyValue = function(keyValues, pair) {
  const [key, value] = pair.split('=');
  keyValues[key] = value;
  return keyValues;
};

const parseKeyValuePairs = function(keyValuePairs) {
  const pairs = keyValuePairs.split('&');
  return pairs.reduce(collectKeyValue, {});
};

const formatBody = function(body, contentType){
  if(contentType === 'application/x-www-form-urlencoded'){
    return parseKeyValuePairs(body);
  }
  return body;
};

const parseQuery = function(entireUrl) {
  const [url, queryString] = entireUrl.split('?');
  const query = queryString && parseKeyValuePairs(queryString);
  return {url, query};
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
    const [firstLine, ...headersText] = requestLines.slice(0, emptyLineIndex);
    const [method, entireUrl] = firstLine.split(' ');
    const {url: actualUrl, query} = parseQuery(entireUrl);
    const url = actualUrl === '/' ? '/index.html' : actualUrl;
    const headers = parseHeaders(headersText);
    const actualBody = requestLines.slice(emptyLineIndex + 1).join('\n');
    const body = formatBody(actualBody, headers['Content-Type']);
    return new Request(method, url, query, headers, body);
  }

  getCookies() {
    if (!this.headers.Cookie) {
      return {};
    }
    const cookieKeyValues = this.headers.Cookie.split(' ;');
    return cookieKeyValues.reduce((cookies, pair) => {
      const [key, value] = pair.split('=');
      cookies[key] = value;
      return cookies;
    }, {});
  }
}

exports.Request = Request;
