'use strict';
/**
 * this file is app enter
 */
const Honeybee = require('../../');
const log = require('../../log');
const app = new Honeybee();
app.ready(true);

module.exports = app;
