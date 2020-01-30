const {createServer} = require('http');
const {pickHandler} = require('./handlers.js');

const server = createServer();

const handleRequest = function(req, res) {
  const remote = {ip: req.socket.remoteAddress, port: req.socket.remotePort};
  console.info('request for', req.url, 'from remote', remote);
  req.on('error', err => console.error('error from remote', remote, err));
  const handler = pickHandler(req);
  handler(req, res);
};

server.on('request', handleRequest);
server.on('close', () => {
  console.info('server is closed');
});

server.listen(process.argv[2], () => {
  console.log('server is listening on :', server.address().port);
});
