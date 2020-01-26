const net = require('net');
const {Request} = require('./lib/request');
const {generateResponse} = require('./lib/app');

const handleRequest = function(reqSocket) {
  const remote = {
    port: reqSocket.remotePort,
    address: reqSocket.remoteAddress
  };
  console.info('\n\nConnection from:', remote, '\n');
  reqSocket.setEncoding('UTF8');
  reqSocket.on('data', msg => {
    const req = Request.parse(msg);
    console.log('Request From', remote, ':\n', req, '\n');
    const response = generateResponse(req);
    response.sendVia(reqSocket);
  });
  reqSocket.on('end', () => console.info('Closed connection of', remote, '\n'));
};

const main = function(port) {
  const server = new net.Server();
  server.on('connection', handleRequest);
  server.listen(port);
  console.info('\nServer is On, You Can Connect To:', server.address());
};

main(process.argv[2]);
