/* eslint no-console: 0 */
'use strict';
const _ = require('lodash');
const defaultCfg = require('./config_default');

let userCfg = {};
try {
  userCfg = require('./config');
} catch (e) {
  console.log('[WARN]', e.message);
}

module.exports = _.merge(defaultCfg, userCfg);
