'use strict';

const cookieSession = require('cookie-session');
const _ = require('lodash');

let defaultOptions = {
  name: 'session',
  path: '/',
  httpOnly: true,
  secure: false,
  maxAge: 8 * 60 * 60 * 1000
};

module.exports = function (app, options) {
  if (!options.secret) {
    throw new Error('missing param options.secret');
  }
  options = _.merge({}, defaultOptions, options);

  return cookieSession(options);
};
