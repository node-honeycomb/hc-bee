'use strict';

const cookieParser = require('cookie-parser');

module.exports = function (app, options) {
  return cookieParser(options.secret, options);
};
