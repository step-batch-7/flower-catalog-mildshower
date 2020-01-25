const net = require('net');
const { Request } = require('./lib/request');
const { pickHandler } = require('./lib/handlers');

const handleRequest = function(requestSocket) {
  const remote = {
    port: requestSocket.remotePort,
    address: requestSocket.remoteAddress
  };
  console.info(`\n\nRequest received from:`, remote);
  requestSocket.setEncoding('UTF8');
  requestSocket.on('data', msg => {
    console.info('\n' + msg);
    const req = Request.parse(msg);
    console.log(req);
    const handler = pickHandler(req);
    const response = handler(req);
    response.sendVia(requestSocket);
  });
  requestSocket.on('end', function() {
    console.info(`Closed request of`, remote, '\n');
  });
};

const main = function(port) {
  const server = new net.Server();
  server.on('connection', handleRequest);
  server.listen(port);
  console.info(`\nServer is On, You Can Connect To:`, server.address());
};

main(process.argv[2]);
