const {readFileSync, existsSync, statSync, writeFileSync} = require('fs');
const {parse} = require('querystring');
const App = require('./app');
const CONTENT_TYPES = require('./contentTypes.json');
const STATUS_MESSAGES = require('./statusMsgs.json');

const INDENT_SPACE = 2;
const REDIRECT_STATUS = 303;
const COMMENTS_PATH = 'data/comments.json';

const isExistingFile = function(filePath){
  return existsSync(filePath) && statSync(filePath).isFile();
};

const getComments = function() {
  if(!isExistingFile(COMMENTS_PATH)) {
    return [];
  }
  return JSON.parse(readFileSync(COMMENTS_PATH, 'UTF8'));
};

const COMMENTS = getComments();

const saveComments = function(){
  const commentsStr = JSON.stringify(COMMENTS, null, INDENT_SPACE);
  writeFileSync('data/comments.json', commentsStr);
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

const gatherBody = function(req, res, next){
  let body = '';
  req.on('data', data => {
    body += data;
  });
  req.on('end', () => {
    req.body = body;
    next();
  });
};

const getNotFoundResponse = function(req, res) {
  const notFoundPage = `<html>
    <head>
      <title>NOT FOUND</title>
    </head>
    <body>
      <h1 style="text-align:center">OOPS! REQUESTED RESOURCE IS NOT FOUND</h1>
    </body>
  </html>`;
  res.statusCode = 404;
  res.statusMessage = 'NOT FOUND';
  res.end(notFoundPage);
};

const getStaticFileResponse = function(req, res, next) {
  const path = req.url === '/' ? '/index.html' : req.url;
  const filePath = `public${path}`;
  if (!isExistingFile(filePath)) {
    return next();
  }
  const extension = filePath.split('.').pop();
  res.setHeader('Content-Type', CONTENT_TYPES[extension]);
  res.end(readFileSync(filePath));
};

const getGuestPage = function(req, res) {
  const tableRows = COMMENTS.reduce(generateRows, '');
  res.setHeader('Content-Type', 'text/html');
  res.end(fillTemplate('guestPage.html', {tableRows}));
};

const performCommentSubmission = function(req, res) {
  const nameAndComment = parse(req.body);
  COMMENTS.unshift(generateCommentObj(nameAndComment));
  saveComments();
  const headers = {location: 'guestPage.html'};
  res.writeHead(REDIRECT_STATUS, STATUS_MESSAGES[REDIRECT_STATUS], headers);
  res.end();
};

const app = new App();

app.use(gatherBody);
app.get(getGuestPage, '/guestPage.html');
app.get(getStaticFileResponse);
app.post(performCommentSubmission, '/submitComment');
app.use(getNotFoundResponse);

module.exports = {app};
