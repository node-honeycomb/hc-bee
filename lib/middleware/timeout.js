'use strict';

const timeout = require('connect-timeout');

/**
 * [exports description]
 * @param  {[type]} app    [description]
 * @param  {Objext} config
 *         respond {Boolean} default is true
 */
module.exports = function (app, config) {
  return timeout(config.timeout, config);
};
