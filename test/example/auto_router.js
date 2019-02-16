/** do not modify this file, genaratered by api-annotation **/
'use strict';

/*
function process(fn, type, wrap, config) {
  if (type === 'public') {
    return fn;
  }
  if (wrap) {
    return function (req, callback) {
      fn(req, callback);
    };
  } else {
    return function (req, res, next) {
      fn(req, res, next);
    };
  }
}
*/
function defaultProcess(fn, type, wraped) {
  return fn;
}
const ctrls = {
  './controller/test.js': require('./controller/test.js')
};
var config = {};

module.exports = function (router, process) {
  if (!process) {
    process = defaultProcess;
  }
  router.get('/timeout', process(ctrls['./controller/test.js'].timeout, 'public', true));
  router.get('/time', process(ctrls['./controller/test.js'].time, 'public', true));
  router.get('/test', process(ctrls['./controller/test.js'].test, 'public', true));
  router.get('/test_combine3', process(ctrls['./controller/test.js'].combine3, 'public', false));
  router.get('/test_combine2', process(ctrls['./controller/test.js'].combine2, 'public', false));
  router.get('/test_combine1', process(ctrls['./controller/test.js'].combine1, 'public', false));
  router.get('/test_async_func3/:status', process(ctrls['./controller/test.js'].asyncfn3, 'public', false));
  router.get('/test_async_func2/:status', process(ctrls['./controller/test.js'].asyncfn2, 'public', true));
  router.get('/test_async_func1/:status', process(ctrls['./controller/test.js'].asyncfn1, 'public', true));
  router.get('/testResJsonError', process(ctrls['./controller/test.js'].testResJsonError, 'public', true));
  router.get('/testProxyStatusCode201', process(ctrls['./controller/test.js'].testProxyStatusCode201, 'public', true));
  router.get('/testCreated', process(ctrls['./controller/test.js'].testCreated, 'public', false));
  router.get('/log_trace_id', process(ctrls['./controller/test.js'].log_trace_id, 'public', true));
  router.get('/hi/*', process(ctrls['./controller/test.js'].hi, 'public', true));
  router.get('/genCtrl', process(ctrls['./controller/test.js'].genCtrl, 'public', true));
  router.get('/exception', process(ctrls['./controller/test.js'].exception, 'public', true));
  router.get('/error', process(ctrls['./controller/test.js'].error, 'public', true));
  router.get('/error_generator', process(ctrls['./controller/test.js'].error_generator, 'public', true));
  router.get('/ctrl', process(ctrls['./controller/test.js'].ctrl, 'public', true));
  router.get('/callback_error_throw', process(ctrls['./controller/test.js'].callbackErrorThrow, 'public', true));
  router.get('/callback_error', process(ctrls['./controller/test.js'].callbackError, 'public', true));
  router.get('/callback_error_err', process(ctrls['./controller/test.js'].callbackErrorErr, 'public', true));
  router.get('/callback_error_404', process(ctrls['./controller/test.js'].callbackError404, 'public', true));
  router.get('/callback_error_403', process(ctrls['./controller/test.js'].callbackError403, 'public', true));
};
