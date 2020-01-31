const {parse} = require('querystring');
const {info} = require('console');

const findValidHandlers = function(routes, req){
  const validRoutes = routes.filter(route => {
    if(!route.method) {
      return true;
    }
    const areMethodsSame = route.method === req.method;
    if(route.path === undefined){
      return areMethodsSame;
    }
    return areMethodsSame && route.path === req.path;
  });
  return validRoutes.map(route => route.handler);
};

const separatePathAndQuery = function(req){
  const [path, queryStr] = req.url.split('?');
  req.query = parse(queryStr);
  req.path = path;
};

class App{
  constructor(){
    this.routes = [];
  }

  use(handler){
    this.routes.push({handler});
  }

  get(handler, path){
    this.routes.push({handler, path, method: 'GET'});
  }

  post(handler, path){
    this.routes.push({handler, path, method: 'POST'});
  }

  serve(req, res){
    info(`Request ${req.socket.remotePort}:${req.method}${req.url}`);
    separatePathAndQuery(req);
    const matchedHandlers = findValidHandlers(this.routes, req);
    const next = function(){
      const handler = matchedHandlers.shift();
      handler && handler(req, res, next);
    };
    next();
  }
}

module.exports = App;
