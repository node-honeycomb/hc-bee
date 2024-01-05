'use strict';

const cookieParser = require('cookie-parser');

module.exports = function (app, options) {
  // secret 需要和express-session的 secret对齐
  return cookieParser(options.secret, options);
};
