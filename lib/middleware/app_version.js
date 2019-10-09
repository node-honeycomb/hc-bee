const {join} = require('path');

module.exports = (app, config) => {
  const path = config.path || '__app_version__';
  const prefix = app.config.prefix || '/';
  let appPkg;

  try {
    appPkg = require(join(app.config.root, './package.json'));
  } catch (e) {
    return (req, res, next) => next();
  }

  return (req, res, next) => {
    if(req.baseUrl === `${prefix}/${path}`) {
      res.json({
        name: appPkg.name,
        version: appPkg.version,
        build: appPkg.build || 1
      });

      return;
    }

    next();
  }
}