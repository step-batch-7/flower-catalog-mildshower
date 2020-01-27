const {readFileSync, existsSync, statSync, writeFileSync} = require('fs');
const {Response} = require('./response');
const CONTENT_TYPES = require('./contentTypes.json');

const INDENT_SPACE = 2;
const COMMENTS_PATH = 'data/comments.json';

const getComments = function() {
  if(!existsSync(COMMENTS_PATH)) {
    return [];
  }
  return JSON.parse(readFileSync(COMMENTS_PATH, 'UTF8'));
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

const getNotFoundResponse = function() {
  const res = new Response();
  res.body = `<html>
    <head>
      <title>NOT FOUND</title>
    </head>
    <body>
      <h4>requested resource is not found on the server</h4>
    </body>
  </html>`;
  return res;
};

const getStaticFileResponse = function(req) {
  const filePath = `public${req.url}`;
  if (!isExistingFile(filePath)) {
    return getNotFoundResponse();
  }
  const extension = filePath.split('.').pop();
  const res = new Response();
  res.setStatusCodeOk();
  res.body = readFileSync(filePath);
  res.setHeader('Content-Type', CONTENT_TYPES[extension]);
  return res;
};

const getGuestPage = function() {
  const res = new Response();
  const allComments = getComments();
  const tableRows = allComments.reduce(generateRows, '');
  res.body = fillTemplate('guestPage.html', {tableRows});
  res.setStatusCodeOk();
  return res;
};

const performCommentSubmission = function(req) {
  const allComments = getComments();
  allComments.unshift(generateCommentObj(req.body));
  const commentsStr = JSON.stringify(allComments, null, INDENT_SPACE);
  writeFileSync('data/comments.json', commentsStr);
  const res = new Response();
  res.redirect('guestPage.html');
  return res;
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

const generateResponse = function(req) {
  const handler = pickHandler(req);
  return handler(req);
};

exports.generateResponse = generateResponse;
