'use strict';
const BaseApp = require('./lib/base_application');
/**
 * @class Task
 */
class Task extends BaseApp {
  run(cb) {
    cb(null, {}, true);  // true indicates it's a task app
  }
}

module.exports = Task;
