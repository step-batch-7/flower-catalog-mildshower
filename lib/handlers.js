const { readFileSync, existsSync, statSync } = require('fs');
const { Response } = require('./response');
const CONTENT_TYPES = require('./contentTypes.json');

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

const getFileDataResponse = function(req) {
  const filePath = `public${req.url}`;
  const isExistingFile = existsSync(filePath) && statSync(filePath).isFile();
  if (!isExistingFile) return getNotFoundResponse();
  const extension = filePath.split('.').pop();
  const res = new Response();
  res.setStatusCodeOk();
  res.body = readFileSync(filePath);
  res.setHeader('Content-Type', CONTENT_TYPES[extension]);
  return res;
};

const pickHandler = function(req) {
  if (req.method === 'GET') return getFileDataResponse;
  return getNotFoundResponse;
};

exports.pickHandler = pickHandler;
