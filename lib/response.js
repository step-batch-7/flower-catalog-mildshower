const STATUS_MSGS = require('./statusMsgs.json');

class Response {
  constructor() {
    this.protocol = 'HTTP/1.1';
    this.statusCode = 404;
    this.headers = [];
    this.body = '';
  }

  setHeader(key, value) {
    this.headers.push({key, value});
  }

  setStatusCodeOk() {
    this.statusCode = 200;
  }

  sendVia(socket) {
    const statusMsg = STATUS_MSGS[this.statusCode];
    const firstLine = `${this.protocol} ${this.statusCode} ${statusMsg}\r\n`;
    this.setHeader('content-length', this.body.length);
    const headersLines = this.headers.map(function(header) {
      return `${header.key}:${header.value}`;
    });
    const headersText = `${headersLines.join('\r\n')}\r\n\r\n`;
    socket.write(firstLine);
    socket.write(headersText);
    socket.write(this.body);
  }

  redirect(location) {
    this.setHeader('location', location);
    this.statusCode = 303;
  }
}

exports.Response = Response;
