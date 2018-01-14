'use strict';

module.exports = function (app) {
  let req = app.express.request;
  req.__timer = {};
  /**
   * 计时函数
   * @param  {String} key
   */
  req.time = function (key) {
    this.__timer[key] = new Date();
  };
  /**
   * 计时函数
   * @param  {String} key
   */
  req.timeEnd = function (key) {
    let start = this.__timer[key];
    let end = new Date();
    this.log.info(`Timer: ${key} start: ${start.getTime()} cost: ${end - start}ms`);
  };
};
