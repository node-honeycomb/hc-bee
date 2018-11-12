'use strict';

const log = require('../common/log');
const urllib = require('urllib');

function* test() {
  let p = new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve('hello');
    }, 1000);
  });
  return yield p;
}
/**
 * @api /test
 */
exports.test = function (req, callback) {
  log.info('test for log instance is ok');
  callback(null, 'hello', 'text');
};

/**
 * @api /hi/*
 */
exports.hi = function (req, callback) {
  log.info('test for log instance is ok');
  callback(null, 'hi', 'text');
};
/**
 * @api /ctrl
 */
exports.ctrl = function (req, callback) {
  callback(null, {ok: 1});
};

/**
 * @api /genCtrl
 */
exports.genCtrl = function* (req) {
  let v = yield test;
  let query = req.query;
  switch (query.test) {
    case 'error':
      return new Error('error_message');
    case 'object_return':
      return {hello: v};
    default:
      return [null, {hello: v}];
  }
};

/**
 * @api /error
 */
exports.error = function (req, callback) {
  process.emit('error', 'mock_error');
};

/**
 *
 * @api /timeout
 */
exports.timeout = function (req, callback) {
  setTimeout(function () {
    callback(null, 'hello');
  }, 3000);
};


/**
 * @api /time
 */
exports.time = function* (req) {
  let p = new Promise(function (ok, err) {
    setTimeout(function () {
      ok();
    }, 100);
  });
  req.time('haha');
  yield p;
  req.timeEnd('haha');
  return 'ok';
};


/**
 * @api /error_generator
 */
exports.error_generator = function* (req) {
  throw new Error('test_error');
};

/**
 * @api /log_trace_id
 */
exports.log_trace_id = function (req, callback) {
  req.log.info('test for log trace id');
  callback(null, 'hello');
};

/**
 * @api /exception
 */
exports.exception = function (req, callback) {
  // setTimeout(function () {
  throw new Error('custom controller exception for test');
  // }, 10);
};

/**
 * @api /callback_error
 */
exports.callbackError = function (req, callback) {
  callback('custom_error');
};

/**
 * @api /callback_error_403
 */
exports.callbackError403 = function (req, callback) {
  callback(403);
};

/**
 * @api /callback_error_err
 */
exports.callbackErrorErr = function (req, callback) {
  callback(new Error('custom_error'));
};

/**
 * @api /callback_error_404
 */
exports.callbackError404 = function (req, callback) {
  callback('NOT FOUND');
};

/**
 * @api /callback_error_throw
 */
exports.callbackErrorThrow = function (req, callback) {
  throw 'custom_error';
};


/**
 * @api /test_async_func1/:status
 */
exports.asyncfn1 = async function (req) {
  let status = req.params.status;
  if (status === 'ok') {
    return 'ok';
  } else if (status === 'error') {
    throw new Error('async_error');
  }
};

/**
 * @api /test_async_func2/:status
 */
exports.asyncfn2 = async function (req, callback) {
  let status = req.params.status;
  if (status === 'ok') {
    callback(null, 'ok');
  } else if (status === 'error') {
    throw new Error('async_error');
  }
};
/**
 * @api /test_async_func3/:status
 */
exports.asyncfn3 = async function (req, res, next) {
  let status = req.params.status;
  if (status === 'ok') {
    res.end('ok');
  } else if (status === 'error') {
    throw new Error('async_error');
  }
};

/**
 * @api /test_combine1
 * @nowrap
 */
exports.combine1 = function (req, res) {
  res.end(' testCombine1');
};

/**
 * @api /test_combine2
 * @nowrap
 */
exports.combine2 = function (req, res) {
  res.end(' testCombine2');
};

/**
 * @api /test_combine3
 * @nowrap
 */
exports.combine3 = function (req, res) {
  res.end(' testCombine3');
};

/**
 * @api /testCreated
 * @nowrap
 */
exports.testCreated = function (req, res) {
  res.status(201).end('created');
};

/**
 * @api /testProxyStatusCode201
 */
exports.testProxyStatusCode201 = function (req, callback) {
  urllib.request('http://localhost:12345/test/testCreated', {
    streaming: true,
    stream: req
  }, function (err, data, res) {
    callback(err, res, 'stream');
  });
};

/**
 * @api /testResJsonError
 */
exports.testResJsonError = function (req, callback) {
  let data = {};
  data.data = data;
  callback(null, data);
};
