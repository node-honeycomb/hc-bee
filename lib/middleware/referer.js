'use strict';

const Url = require('url');
const _ = require('lodash');
const defaultOptions = {
  /**
   * 判断 请求是否需要检查 referer
   * @param  {Request} req
   * @return {Boolean}  true则检查referer, false则跳过检查
   */
  ignore: function (req) {
    return false;
  },
  /**
   * 合法的列表
   * @type {Array} domain 列表
   *
   * example : [
   *     'www.taobao.com',  // 字符串
   *     /\.taobao\.com/    // 支持正则
   * ]
   *
   */
  allowDomain: []
};
/**
 * referer 检查器
 */
module.exports = function (app, options) {
  options = _.merge({}, defaultOptions, options);
  if (options.match) {
    options.ignore = options.match;
  }
  let allowDomain = options.allowDomain;
  let domainMap = {};
  let domainRegExp = [];
  allowDomain.forEach(function (v) {
    if (!v) {
      return;
    }
    if (typeof v === 'string') {
      domainMap[v] = true;
    } else if (v instanceof RegExp) {
      domainRegExp.push(v);
    }
  });
  let len = domainRegExp.length;
  function regCheck(hostname) {
    for (let i = 0; i < len; i++) {
      if (domainRegExp[i].test(hostname)) {
        return true;
      }
    }
    return false;
  }
  return function MiddlewareReferer(req, res, next) {
    if (!options.ignore(req)) {
      return next();
    }
    let hostname = req.hostname;
    let referer = req.headers.referer || '';
    referer = Url.parse(referer);
    let refhost = referer.hostname;
    if (
      !refhost ||
      refhost === hostname ||
      domainMap[refhost] ||
      regCheck(refhost)
    ) {
      return next();
    }
    let err = {
      message: `REFERER_EXCEPTION, referer domain '${referer.hostname}' not allowed, please setup middleware 'referer' with 'config.allowDomain' option`,
      code: 'FORBIDDEN',
      status: 403
    };
    next(err);
  };
};
