const {join} = require('path');

module.exports = (app, config) => {
  const path = config.path || 'app.status';
  const prefix = app.config.prefix || '/';
  let appPkg;

  try {
    appPkg = require(join(app.config.root, './package.json'));
  } catch (e) {
    return (req, res, next) => next();
  }

  return (req, res, next) => {
    if(!appPkg) {
      next();

      return;
    }

    if(req.baseUrl !== `${prefix}/${path}`) {
      next();

      return;
    }
    
    const basic = {
      name: appPkg.name,
      version: appPkg.version,
      build: appPkg.build || 1
    };

    if(!req.query || !req.query.dep) {
      res.json(basic);

      return;
    }

    let {dep = ''} = req.query;
    let deps = [];

    if(dep) {
      deps = dep.split(',');
    }

    if(!appPkg.dependencies) {
      next();

      return;
    }

    basic.deps = {};

    for(let d of deps) {
      const version = appPkg.dependencies[d];
      if(!version) {
        continue;
      }

      basic.deps[d.trim()] = version
    }

    res.json(basic);
  }
}