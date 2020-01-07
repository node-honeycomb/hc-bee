'use strict';

const _ = require('lodash');

let defaultOptions = {
  log: 'sys',
  requestTraceId: 'eagleeye-traceid'
};

module.exports = function (app, options) {
  options = _.merge({}, defaultOptions, options);
  let ridHeaderName = options.requestTraceId || 'eagleeye-traceid';
  ridHeaderName = ridHeaderName.toLowerCase();

  let req = app.express.request;
  let funcs = [
    'debug',
    'trace',
    'info',
    'warn',
    'error'
  ];
  let defaultLog = app.getLog(options.log);
  Object.defineProperty(req, 'log', {
    get: function () {
      if (this._log) {
        return this._log;
      } else {
        let rid = this.rid || 'err_missing_rid';
        let ridLog = {};
        funcs.forEach((fn) => {
          ridLog[fn] = function () {
            let args = [].slice.call(arguments);
            args.push(rid);
            defaultLog[fn].apply(defaultLog, args);
          };
        });
        this._log = ridLog;
        return ridLog;
      }
    },
    enumerable: true
  });

  return function (req, res, next) {
    let rid = req.headers[ridHeaderName];
    req.rid = rid;
    next();
  };
};
