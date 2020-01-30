const findValidHandlers = function(routes, req){
  const validRoutes = routes.filter(route => {
    if(!route.method) {
      return true;
    }
    const areMethodsSame = route.method === req.method;
    if(route.path === undefined){
      return areMethodsSame;
    }
    return areMethodsSame && route.path === req.url;
  });
  return validRoutes.map(route => route.handler);
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
    const matchedHandlers = findValidHandlers(this.routes, req);
    const next = function(){
      if(matchedHandlers.length === 0){
        return;
      }
      const handler = matchedHandlers.shift();
      handler(req, res, next);
    };
    next();
  }
}

module.exports = App;
