'use strict';

const path = require('path');
const express = require('express');
const _ = require('lodash');
const defaultOptions = {
  root: null,
  lastModified: true
};

module.exports = function (app, options) {
  if (!options.root) {
    options.root = path.join(app.root, './assets');
  }

  let opts = _.merge({}, defaultOptions, options);
  return express.static(opts.root, opts);
};
