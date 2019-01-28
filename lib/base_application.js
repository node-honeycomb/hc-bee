'use strict';

const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const Events = require('events');
const litelog = require('litelog');

const log = require('../log');
const utils = require('./utils');
const ready = require('./ready');

function findAppRoot(dir) {
  try {
    // 1. dir is app's dir, and node can resolve
    // 2. dir is app's entrance file
    return path.dirname(require.resolve(dir));
  } catch (e) {
    // node can't resolve
    return dir;
  }
}

class BaseApplication extends Events {
  /**
   * Application constructor
   * @param  {Object} options
   *         - root {Path} app root
   */
  constructor() {
    let options = {};
    // 获取honeybee的默认配置
    let frameworkConfig = require('../config');
    // prepare framework's default config
    utils.prepareConfig(frameworkConfig, path.join(__dirname, '../config'));
    // 获取来自环境变量的配置信息，由托管环境提供，honeycomb服务器端启动时给出
    let envConfig = utils.getPrivateConfig();
    options.root = envConfig.appRoot || findAppRoot(envConfig.file);
    if (!options.root) {
      throw new Error('Environment Error app.root is empty');
    }
    // server根目录，来自托管环境告知
    options.serverRoot = envConfig.serverRoot;
    // server的类型，可用于区分公有云或专有云
    options.serverEnv = envConfig.serverEnv;
    // 目标监听sock，由server提供
    options.targetSock = envConfig.targetSock;
    // 加载应用的环境配置
    let appConfigPath = path.join(options.root, './config');
    let appConfig = {};
    try {
      appConfig = require(appConfigPath);
      utils.prepareConfig(appConfig, appConfigPath);
      console.log('[INFO] app\'s config loaded'); // eslint-disable-line
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND') {
        console.log('[WARN] app\'s config not found'); // eslint-disable-line
      } else {
        e.message = '[ERROR] loading app\'s config failed: ' + e.message;
        throw e;
      }
    }

    super();
    this.local = process.env.HC_CLI;
    this.handleException();
    this.isExiting = false;
    ready.mixin(this);

    this.wait(true);
    this.wait('BUILDIN_CONFIG');
    if (typeof appConfig.ready === 'function') {
      appConfig.ready(() => {
        this.init(frameworkConfig, options, appConfig, envConfig);
      });
    } else {
      this.init(frameworkConfig, options, appConfig, envConfig);
    }
  }
  init(frameworkConfig, frameworkOptions, appConfig, envConfig) {
    // 继承关系 frameworkConfig <- app-config <- env-config <- frameworkOptions
    // frameworkOptions 放最后防止被用户配置覆盖
    let options = _.mergeWith({}, frameworkConfig, appConfig, envConfig.config, frameworkOptions, (objValue, srcValue) => {
      if (_.isArray(objValue)) {
        return _.union(objValue, srcValue);
      }
    });
    this.root = options.root;
    let appPkg = require(path.join(this.root, './package.json'));
    if (options.prefix === true) {
      options.prefix = '/' + appPkg.name;
    }
    /**
     * 替换配置中的一些全局变量
     */
    let configVars = {
      appName: appPkg.name,
      appVersion: appPkg.version,
      appBuildNum: appPkg.build || 1,
      serverRoot: envConfig.serverRoot,
      env: envConfig.env
    };
    utils.processVars(options, configVars);

    // 这里会修改应用的config，浅拷贝即可
    Object.assign(appConfig, options);
    // 最终的options,输出到$dir/runtime_config.json文件
    if (options.dumpConfig) {
      try {
        fs.writeFileSync(path.join(options.root, './runtime_config.json'), JSON.stringify(options, null, 2));
      } catch (e) {
        console.log('[ERROR] dump runtime config failed', e.message); // eslint-disable-line
      }
    }

    let logCfg = options.logs || {sys: {level: 'DEBUG'}};
    this.log = log.init(logCfg, options.debug);
    this.log.setRoot(this.root);
    this.keys = options.keys;

    this.log.warn('new Application:', options.name || 'name is missing, setup options.name', 'app.root:', this.root);

    this.options = options;
    this.config = options;

    this.ready('BUILDIN_CONFIG');
  }
  /**
   * 框架启动, 可以重写此方法，根据自己的需求定制
   * @param  {Function} cb
   * @param  {object} config {port}
   */
  run(cb, config) {
    if (this.isExiting) {
      return cb('app is exiting');
    }
    let self = this;
    this.local = !!config;

    this.ready(function () {
      cb && cb(null, config);
    });
  }
  getLog(name) {
    return this.log.get(name);
  }
  /**
   * app 退出
   * @param  {String} msg
   * @param  {Number} code
   */
  exit(msg, code) {
    this.isExiting = true;
    // 如果由 honeycomb-cli启动，则直接退出
    if (this.local) {
      if (msg.code &&  msg.code.indexOf('uncaughtException') === 0) {
        // because CLI will listen uncaughtException and print error info
        return;
      }
      return log.error(msg);
    }

    this.log.error('app exit because', msg);
    let waitForExit = this.options.waitForExit;
    if (this.serv) {
      let flagEmitError = false;
      function done() {
        if (flagEmitError) {
          return;
        }
        flagEmitError = true;
        litelog.end(function () {
          process.emit('error', {message: msg, exitCode: code});
        });
      }
      setTimeout(this.exit, waitForExit);
      this.serv.close(done);
    } else {
      litelog.end(function () {
        process.emit('error', {message: msg, exitCode: code});
      });
    }
  }
  /**
   * 处理进程异常信息
   */
  handleException() {
    if (this.isExiting) {
      return;
    }
    process.on('unhandledRejection', (reason, p) => {
      this.log.error(`Unhandled Rejection at: Promise ${p}, reason: ${reason.stack}`);
    });
    process.on('uncaughtException', (err) => {
      /*
      if (
        (err.code === 'EADDRINUSE' && err.message.match(/listen EADDRINUSE/)) ||
        (err.code === 'EACCES' && err.message.match(/listen EACCES/))
      ) {
        // if EADDRINUSE or EACCES, do not exit process
        // retry is useless, should check permission or check port
        return this.log err;
      }
      */
      if (!_.isObject(err)) {
        err = {
          code: 'ERROR',
          message: err
        };
      }
      err.code = 'uncaughtException:' + err.code;
      this.exit(err);
    });
  }
}

BaseApplication.prepareConfig = utils.prepareConfig;

module.exports = BaseApplication;
