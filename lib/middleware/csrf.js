'use strict';

/**
 * 此中间件挂载之后，req对象上将会增加一个方法 `req.csrfToken()`
 * 此方法用来获取 csrf token
 */
const _ = require('lodash');
const csrf = require('csurf');

const defaultOptions = {
  sessionKey: 'session',
  // csrf options, ref: https://github.com/pillarjs/csrf/blob/master/index.js#L45
  saltLength: 8 ,    // The string length of the salt
  secretLength: 18,   // The byte length of the secret key
  /**
   * @param  {Request} req
   * @return {Boolean} true 表示跳过csrf校验, false 表示需要校验
   */
  ignore: function (req) {
    // 如果前端请求也伪造增加签名字段，auth中间件的校验是签名优先的，所以不会绕过去
    return !!req.headers.signature || !!req.headers.authorization;
  },
  cookie: true // {signed: true, key: '_csrf'}, signed 依赖 express-session的 req.secert
};

module.exports = function (app, options) {
  let opts = _.merge({}, defaultOptions, options);
  /*
  if (!opts.secret) {
    throw new Error("middleware csrf missing `middleware.csrf.config.secret`, should be 32 bytes(e.g. 32 characters)")
  }
  */
  let csrfCheck = csrf(opts);
  return function (req, res, next) {
    if (opts.ignore(req)) {
      return next();
    } else {
      csrfCheck(req, res, next);
    }
  };
};
