const log = require('./common/log');

module.exports = function (config) {
  log.info('task daemon run:', config.name);
}