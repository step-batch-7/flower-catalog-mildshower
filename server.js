const {createServer} = require('http');
const {info} = require('console');
const {app} = require('./handlers.js');

const main = function(){
  const server = createServer();
  server.on('request', (req, res) => app.serve(req, res));
  server.on('close', () => info('server is closed'));
  const [,, port] = process.argv;
  server.listen(port, () => {
    info('server is listening on :', server.address().port);
  });
};

main();
