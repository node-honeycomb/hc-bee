'use strict';

module.exports = function (router) {
  router.get('/test_err_middleware', function (req, res, next) {
    next({
      code: 'ERR_GEN_MIDDLEWARE',
      message: 'err_message'
    });
  });

  router.get('/test_middleware', function (req, res, next) {
    if (!req[req.query.q]) {
      return next('method not found');
    }
    res.end(req[req.query.q]());
  });

  router.get('/test_cookie_session', function (req, res) {
    let body;
    switch (req.query.action) {
      case 'get':
        body = req.session.name;
        break;
      case 'set':
        req.session.name = 'session.' + req.query.data;
        body = 'success';
        break;
      default:
        body = 'null';
    }
    res.end(body);
  });

  router.get('/test_csrf', function (req, res) {
    res.end(req.csrfToken());
  });

  router.post('/test_csrf', function (req, res) {
    res.end('success');
  });

  router.get('/test_gen_ctrl', function* (req, res) {
    yield new Promise(function (resolve, reject) {
      setTimeout(function () {
        resolve();
      }, 200);
    });
    res.end('success');
  });

  router.get('/test_redirect', function (req, res) {
    res.redirect('/test_redirect_success');
  });

  router.get('/test_redirect_illegal', function (req, res) {
    res.redirect('http://illegal_domain/test_redirect_success');
  });

  router.get('/test_redirect_glob', function (req, res) {
    res.redirect('http://www.aliyun.com/test_redirect_success');
  });

  router.get('/test_redirect_full_match', function (req, res) {
    res.redirect('http://test.alibaba.com/test_redirect_success');
  });

  router.get('/test_redirect_glob_match_illegal', function (req, res) {
    res.redirect('http://illegal.alibaba.com/test_redirect_success');
  });

  router.post('/test_body_parser', function (req, res) {
    res.end('success');
  });
};
