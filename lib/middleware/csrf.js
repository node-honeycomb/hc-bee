'use strict';

/**
 * 此中间件挂载之后，req对象上将会增加一个方法 `req.csrfToken()`
 * 此方法用来获取 csrf token
 */
const _ = require('lodash');
const csrf = require('csurf');

const defaultOptions = {
  /**
   * @param  {Request} req
   * @return {Boolean} true 表示跳过csrf校验, false 表示需要校验
   */
  ignore: function (req) {
    // 如果前端请求也伪造增加签名字段，auth中间件的校验是签名优先的，所以不会绕过去
    return !!req.headers.signature || !!req.headers.authorization;
  },
  cookie: true
};

module.exports = function (app, options) {
  let opts = _.merge({}, defaultOptions, options);
  let csrfCheck = csrf(opts);
  return function (req, res, next) {
    if (opts.ignore(req)) {
      return next();
    } else {
      csrfCheck(req, res, next);
    }
  };
};
