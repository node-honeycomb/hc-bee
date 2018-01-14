'use strict';

const minimatch = require('minimatch');
const lodash = require('lodash');
const cors =  require('cors');

var defaultConfig = {
  origin: true,
  credentials: true
};

module.exports = (app, config) => {
  let originGlobPatterns = '';
  if (config.allowOrigins) {
    if (Array.isArray(config.allowOrigins)) {
      if (config.allowOrigins.length === 1) {
        originGlobPatterns = config.allowOrigins[0];
      } else {
        originGlobPatterns = '{' + config.allowOrigins.join(',') + '}';
      }
    } else if (typeof config.allowOrigins === 'string') {
      originGlobPatterns = config.allowOrigins;
    }
  }

  let corsConfig = lodash.merge({}, defaultConfig, config);
  delete corsConfig.allowOrigins;
  let corsMiddleware = cors(corsConfig);

  return (req, res, next) => {
    let origin = req.get('origin');
    if (origin && minimatch(origin, originGlobPatterns)) {
      return corsMiddleware(req, res, next);
    }
    next();
  };
};
