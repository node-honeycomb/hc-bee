'use strict';

const bodyParser  = require('body-parser');
const _ = require('lodash');
const defaultOptions = {
  json: {
    strict: true,
    limit: 512 * 1024,
    verify: function (req, res, buf) {
      req.rawBody = buf;
    }
  },
  urlencoded: {
    strict: true,
    limit: 512 * 1024,
    extended: true,
    verify: function (req, res, buf) {
      req.rawBody = buf;
    }
  }
};

module.exports = function (app, options) {
  options = _.merge(defaultOptions, options);
  return [
    bodyParser.json(options.json),
    bodyParser.urlencoded(options.urlencoded)
  ];
};
