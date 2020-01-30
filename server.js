const {createServer} = require('http');
const {info} = require('console');
const {app} = require('./handlers.js');

const server = createServer();

server.on('request', (req, res) => app.serve(req, res));
server.on('close', () => {
  info('server is closed');
});

server.listen(process.argv[2], () => {
  info('server is listening on :', server.address().port);
});
