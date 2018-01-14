'use strict';

const Url = require('url');
const _ = require('lodash');
const defaultOptions = {
  /**
   * 判断 请求是否需要检查 referer
   * @param  {[type]} req [description]
   * @return {Boolean}  匹配则检查referer, 否则跳过检查
   *
   */
  match: function (req) {
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
    let hostname = req.hostname;
    let referer = req.headers.referer;
    if (!referer || !options.match(req)) {
      return next();
    }
    referer = Url.parse(referer);
    if (
      referer.hostname === hostname ||
      domainMap[referer.hostname] ||
      regCheck(referer.hostname)
    ) {
      return next();
    }
    let err = {
      message: `REFERER_EXCEPTION, referer domain '${referer.hostname}' not allowed, please setup middleware 'referer' with 'config.allowDomain' option`,
      code: 'FORBIDDEN'
    };
    next(err);
  };
};
