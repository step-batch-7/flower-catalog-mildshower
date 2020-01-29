const {readFileSync, existsSync, statSync, writeFileSync} = require('fs');
const {parse} = require('querystring');
const CONTENT_TYPES = require('./lib/contentTypes.json');
const STATUS_MESSAGES = require('./lib/statusMsgs.json');

const INDENT_SPACE = 2;
const COMMENTS_PATH = 'data/comments.json';

const getComments = function() {
  if(!existsSync(COMMENTS_PATH)) {
    return [];
  }
  return JSON.parse(readFileSync(COMMENTS_PATH, 'UTF8'));
};

const saveComments = function(comments){
  const commentsStr = JSON.stringify(comments, null, INDENT_SPACE);
  writeFileSync('data/comments.json', commentsStr);
};

const isExistingFile = function(filePath){
  return existsSync(filePath) && statSync(filePath).isFile();
};

const fillTemplate = function(fileName, replaceTokens) {
  const path = `./templates/${fileName}`;
  const template = readFileSync(path, 'UTF8');
  const keys = Object.keys(replaceTokens);
  const replace = (template, key) => {
    const regExp = new RegExp(`__${key}__`, 'g');
    return template.replace(regExp, replaceTokens[key]);
  };
  return keys.reduce(replace, template);
};

const getHtmlFormat = function(txt) {
  return txt.replace(/ /g, '&nbsp;').replace(/\r\n/g, '<br>');
};

const generateRows = function(rows, comment) {
  const commentRow = `
  <tr>\n
    <td>${new Date(comment.time).toLocaleString()}</td>\n
    <td>${getHtmlFormat(comment.name)}</td>\n
    <td>${getHtmlFormat(comment.comment)}</td>\n
  </tr>\n`;
  return rows + commentRow;
};

const generateCommentObj = function(nameAndComment){
  const {name, comment} = nameAndComment;
  const time = new Date();
  return {name, comment, time};
};

const getNotFoundResponse = function(req, res) {
  const notFoundPage = `<html>
    <head>
      <title>NOT FOUND</title>
    </head>
    <body>
      <h4>requested resource is not found on the server</h4>
    </body>
  </html>`;
  res.statusCode = 404;
  res.statusMessage = 'NOT FOUND';
  res.end(notFoundPage);
};

const getStaticFileResponse = function(req, res) {
  const path = req.url === '/' ? '/index.html' : req.url;
  const filePath = `public${path}`;
  if (!isExistingFile(filePath)) {
    return getNotFoundResponse(req, res);
  }
  const extension = filePath.split('.').pop();
  res.setHeader('Content-Type', CONTENT_TYPES[extension]);
  res.end(readFileSync(filePath));
};

const getGuestPage = function(req, res) {
  const allComments = getComments();
  const tableRows = allComments.reduce(generateRows, '');
  res.end(fillTemplate('guestPage.html', {tableRows}));
};

const performCommentSubmission = function(req, res) {
  const allComments = getComments();
  let body = '';
  req.setEncoding('UTF8');
  req.on('data', data => {
    body += data;
  });
  req.on('end', () => {
    const nameAndComment = parse(body);
    allComments.unshift(generateCommentObj(nameAndComment));
    saveComments(allComments);
    const headers = {location: 'guestPage.html'};
    res.writeHead(303, STATUS_MESSAGES[303], headers);
    res.end();
  });
};

const getHandlers = {
  '/guestPage.html': getGuestPage,
  other: getStaticFileResponse
};

const postHandlers = {
  '/submitComment': performCommentSubmission
};

const handlers = {
  GET: getHandlers,
  POST: postHandlers
};

const pickHandler = function(req) {
  const handlerType = handlers[req.method];
  return handlerType[req.url] || handlerType.other || getNotFoundResponse;
};

module.exports = {pickHandler};
