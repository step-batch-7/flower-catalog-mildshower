const {readFileSync, existsSync, statSync, writeFileSync} = require('fs');
const query = require('querystring');
const App = require('./app');
const Comment = require('./comment.js');
const Comments = require('./comments.js');
const CONTENT_TYPES = require('./contentTypes.json');
const STATUS_MESSAGES = require('./statusMessages.json');

const REDIRECT_STATUS = 303;
const COMMENTS_PATH = 'data/comments.json';

const isExistingFile = function(filePath){
  return existsSync(filePath) && statSync(filePath).isFile();
};

const getCommentsList = function() {
  if(!isExistingFile(COMMENTS_PATH)) {
    return [];
  }
  return JSON.parse(readFileSync(COMMENTS_PATH, 'UTF8') || '[]');
};

const COMMENTS = Comments.from(getCommentsList());

const saveComments = () => writeFileSync(COMMENTS_PATH, COMMENTS.toJSON());

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

const receiveBody = function(req, res, next){
  let body = '';

  req.on('data', data => {
    body += data;
  });

  req.on('end', () => {
    req.body = body;
    if(req.headers['content-type'] === 'application/x-www-form-urlencoded') {
      req.body = query.parse(body);
    }
    next();
  });
};

const getNotFoundResponse = function(req, res) {
  res.statusCode = 404;
  res.statusMessage = 'NOT FOUND';
  res.end(fillTemplate('notFound.html', {path: req.path}));
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
  const tableRows = COMMENTS.toHTML();
  res.setHeader('Content-Type', 'text/html');
  res.end(fillTemplate('guestPage.html', {tableRows}));
};

const performCommentSubmission = function(req, res) {
  const {name, comment} = req.body;
  COMMENTS.add(new Comment(name, comment, new Date()));
  saveComments();
  const headers = {location: 'guestPage.html'};
  res.writeHead(REDIRECT_STATUS, STATUS_MESSAGES[REDIRECT_STATUS], headers);
  res.end();
};

const app = new App();

app.use(receiveBody);
app.get(getGuestPage, '/guestPage.html');
app.get(getStaticFileResponse);
app.post(performCommentSubmission, '/submitComment');
app.use(getNotFoundResponse);

module.exports = {app};
