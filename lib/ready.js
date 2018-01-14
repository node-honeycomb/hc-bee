'use strict';

const debug = require('debug')('app:ready');

function ready(flagOrFunction) {
  if (typeof flagOrFunction === 'function') {
    this._readyCallbacks.push(flagOrFunction);
  } else {
    debug('app readyEvent', flagOrFunction, 'done');
    this._waitMap[flagOrFunction] = true;
  }
  if (checkReady(this._waitMap)) {
    debug('app is ready');
    this._readyCallbacks.splice(0, Infinity).forEach(function (callback) {
      process.nextTick(callback);
    });
  }
}

function wait(name) {
  this._waitMap[name] = false;
}

function checkReady(obj) {
  let flag = true;
  Object.keys(obj).forEach(function (key) {
    flag &= obj[key];
  });
  return flag;
}

exports.mixin = function (obj) {
  obj._waitMap = obj._waitMap || {};
  obj._readyCallbacks = obj._readyCallbacks || [];
  obj.ready = ready;
  obj.wait = wait;
};
