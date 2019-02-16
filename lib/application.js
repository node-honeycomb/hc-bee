'use strict';

const BaseApp = require('./base_application');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const Events = require('events');
const litelog = require('litelog');
const express = require('express');
const http = require('http');
const accepts = require('accepts');

const log = require('../log');
const utils = require('./utils');
const ready = require('./ready');
const responseWraper = require('./response_wraper');
const Koa = require('koa');
var koaRouter = require('koa-router');

const debug = require('debug')('hc-bee');
class Application extends BaseApp {
  /**
   * Application constructor
   * @param  {Object} options
   *         - root {Path} app root
   *         - configDir
   *         - plugConfigKey {String} default
   *         - middleware
   *         - extends
   */
  constructor() {
    super();
  }
  init(frameworkConfig, frameworkOptions, appConfig, envConfig) {
    // console.log(typeof this.__proto__.__proto__.init);
    super.init(frameworkConfig, frameworkOptions, appConfig, envConfig);
    // this.__proto__.__proto__.init.call(this, frameworkConfig, frameworkOptions, appConfig, envConfig);
    /**
     * 初始化express
     */
    // this.express = express();
    // this.express.engine('html', require('ejs').renderFile);
    // this.express.set('views', path.join(this.root, './view'));
    // this.express.set('view cache', !this.options.debug);
    // this.express.set('view engine', 'html');
    // this.express.set('title', this.options.title);
    // this.express.set('env', this.options.env || 'production');
    // this.express.set('query parser', 'extended');
    // this.express.set('x-powered-by', false);
    // this.express.set('view cache', !this.options.debug);
    // this.express.locals.G = {
    //   prefix: this.options.prefix,
    //   staticRoot: this.options.staticRoot || '/assets' // deprecated
    // };
    // TODO: 和express warp为一个，通过配置项切换
    this.koa = new Koa();
    this.koa.router = new koaRouter();
    // just for test,must be remove before release
    this.koa.use(ctx => {
      ctx.body = 'tests Koa alive';
    });

    // TODO 切换到http server监听
    this.server = this.koa.listen(this.options.port);

    this.server.on('error', (err) => {
      log.error('app listen failed');
      this.exit(err);
    });

    this.server.on('clientError', (err, sock) => {
      sock.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
    this.plugins = {
      middleware: {},
      mountedMiddleware: [],
      extension: {}
    };

    // TODO 改在兼容koa的load机制
    /**
     * 挂载配置的middleware
     */
    this.loadMiddleware(this.options.middleware);

    // TODO 改在兼容koa的extension机制,redirect安全机制需要修改,所以在各种config中先关掉了extension
    /**
     * 挂载配置的context插件
     */
    this.loadExtension(this.options.extension);

    this.ready('BUILDIN_CONFIG');
  }
  /**
   * 挂载middleware
   */
  use(match, middleware) {
    if (!middleware) {
      middleware = match;
      match = null;
    }
    if (!middleware) {
      throw new Error('app.use() param needed!');
    }
    if (middleware.constructor.name === 'GeneratorFunction') {
      middleware = utils.wrapMiddleware(middleware);
    }
    if (match) {
      this.express.use(match, middleware);
    } else {
      this.express.use(middleware);
    }
    return this;
  }
  setErrorHandler(handler) {
    if (handler.length !== 4) {
      throw new Error('app.error(handler),  handler should defined as `func(err, req, res, next)`');
    }
    this.config.errorHandler = handler;
  }
  setFallbackHandler(handler) {
    this.config.fallbackHandler = handler;
  }
  /**
   * 框架启动, 可以重写此方法，根据自己的需求定制
   * @param  {Function} cb
   * @param  {object} config {port}
   */
  run(cb, config) {
    if (this.isExiting) {
      return;
    }
    let self = this;
    this.local = !!config;
    let wrapJson = this.options.wrapResponseJson;
    let defaultHttpErrorCode = this.options.defaultHttpErrorCode;
    /**
     * 生成自动路由
     */
    // this.genAutoRouter();
    /**
     * 挂中间件
     */
    this.mountMiddleWare();
    /**
     * 挂载router
     */
    this.mountRouter();
    /**
     * 挂载fallbackHandler, 自定义404请求
     */
    if (this.config.fallbackHandler) {
      this.express.use(this.config.fallbackHandler);
    }
    
    let customErrorHandler = this.config.errorHandler;
    
    // TODO: errorHandle修改 并修改if格式
    if (this.express)
    this.express.use(function (err, req, res, next) {   // eslint-disable-line
      const supportedType = ['text/plain', 'application/json', 'text/html'];
      const mime = accepts(req).types(supportedType) || 'text/plain';
      let type;
      let code;
      let message;
      let httpCode;

      /**
       * err can be {String|Number|Object|Error}
       */

      if (err.type && err.error) {  // Object
        type = err.type;
        err = err.error;
      }

      if (err instanceof Error || typeof err === 'object') {  // Error|{code, message}
        code = err.code || err.name || 'ERROR';
        message = err.message;
        httpCode = err.status || err.statusCode || utils.map[String(code).toUpperCase()] || defaultHttpErrorCode;
      } else if (typeof err === 'number') {
        code = utils.code[err] || 'ERROR';
        message = code;
        httpCode = err;
      } else /* if (typeof err === 'string')*/ {
        code = 'ERROR';
        message = err;
        httpCode = utils.map[String(message).toUpperCase()] || defaultHttpErrorCode;
      }

      code = String(code).toUpperCase();
      res.status(httpCode >= 100 && httpCode < 600 ? httpCode : 500);
      // res.setHeader('content-type', mime);
      self.log.error('REQUEST_ERROR method:', req.method, 'url:', req.url, 'message:', err.stack || err);
      customErrorHandler(err, req, res, (err) => {
        if (err) {
          code = err.code || code;
          message = err.message || message;
        }
        if (type === 'json') {
          if (wrapJson) {
            err = wrapJson({code, message}, null, req.rid);
          }
          res.json(err);
        } else if (type === 'jsonp') {
          if (wrapJson) {
            err = wrapJson({code, message}, null, req.rid);
          }
          res.jsonp(err);
        } else {
          switch (mime) {
            case 'application/json':
              if (wrapJson) {
                err = wrapJson({code, message}, null, req.rid);
              }
              res.json(err);
              break;
            case 'text/plain':
            case 'text/html':
            default:
              res.type(mime);
              res.end(_.escape(`code: ${code},\nmessage: ${message},\nrid: ${req.rid}`));
              break;
          }
        }
      });
    });
    
    let serv = this.server;
    let cbCalled = false;
    serv.on('error', (err) => {
      if (cbCalled) {
        return;
      }
      cbCalled = true;
      cb && cb(err);
      this.exit(err, 1);
    });

    this.ready(function () {
      if (config) {
        serv.listen(config.port, function (err) {
          self.log.debug('app listen at:', config.port);
          if (cbCalled) {
            return;
          }
          cbCalled = true;
          cb && cb(null, serv);
        });
      } else {
        let appPkg = require(path.join(self.options.root, './package.json'));
        let appName = appPkg.name;
        let version = appPkg.version;
        let build = appPkg.build || 1;
        /** from honeycomb server */
        let sock;
        if (self.options.targetSock) {
          sock = self.options.targetSock;
        } else {
          sock = (self.options.serverRoot || '.') + '/run/' + appName + '_' + version + '_' + build + '.sock';
        }
        serv.listen(sock, function () {
          if (cbCalled) {
            return;
          }
          cbCalled = true;
          cb && cb(null, {
            bind: self.options.bind || self.options.port || undefined,
            serverName: self.options.serverName || '*',
            router: self.options.prefix || undefined,
            param: self.options.honeycomb.serverParam || undefined,
            target: sock,
            framework: appPkg.dependencies['hc-bee'] || 'unknow'
          });
        });
      }
      /*
      serv.setTimeout(self.options.serverTimeout, function (socket) {
        socket.end('HTTP/1.1 504 TIMEOUT\r\n\r\n Server Response Timeout');
      });
      */
    });
  }
  /**
   * wrap generator function, support koa style middleware
   * @param  {Function} mw
   * @return {Function}
   *
  wrap(mw) {
    return utils.wrapMiddleware(mw);
  }
  */
  /**
   * 加载插件包， node_modules包
   *   一个插件包会包含  middleware, context, response, request 扩展
   * @param  {Array|String} plugins 插件包数组, 或者单个插件
   */
  loadPlugins(plugins) {
    if (typeof plugins === 'string') {
      plugins = [plugins];
    }
    let self = this;
    plugins.forEach(function (p) {
      self._loadPlugin(p);
    });
  }
  /**
   * 加载插件模块, 注意必须是模块
   *
   *   插件通过 package.json 配置
   *     {
   *       pluginConfig: {
   *         middlewares: [],
   *         context: {id}
   *         response: {id}
   *         request: {id}
   *       }
   *     }
   *
   * @param  {String} pluginPath
   */
  _loadPlugin(pluginPath) {
    let pkg = this._load(
      require(path.join(pluginPath, './package.json')),
      'loading plugin error'
    );
    let key = this.options.pluginConfigKey;
    let pluginConfig = pkg[key];
    if (pluginConfig) {
      return;
    }

    if (pluginConfig.middlewares) {
      pluginConfig.middlewares.forEach(function (n) {
        n.base = pluginPath;
      });
      this.loadMiddleware(pluginConfig.middlewares);
    }
    if (pluginConfig.extension) {
      pluginConfig.context.base = pluginPath;
      this.loadExtension(pluginConfig.context);
    }
  }

  listMiddleware(type) {
    let tmp;
    let message;
    switch (type) {
      case 'mounted':
        tmp = this.plugins.mountedMiddleware;
        message = 'all mounted middlewares:';
        break;
      default:
        tmp = this.plugins.middleware;
        message = 'all variable middlewares:';
    }
    this._print(message, tmp);
  }
  sortMiddleware(mws) {
    this.options.orderedMiddleware = mws;
  }
  /**
   * 加载middleware
   *    middleware 是框架复用的根本
   *    middleware 的挂载顺序有入参决定
   *    此方法可多次调用，每次调用 middleware 依次挂载上去
   *
   *  @param {Array|Object} middlewareConfigList 中间件配置, 支持数组列表，对象列表，或者单个的中间件配置
   *               - middlewareConfig {Object}
   *                 - id {String}
   *                 - config {Object}
   *                 - router {String}
   *                 - module {MiddleWareObject|NodeModuleName|ModulePath}
   *
   */
  loadMiddleware(middlewareConfigList) {
    if (this.isExiting) {
      return;
    }
    if (typeof middlewareConfigList === 'object') {
      if (middlewareConfigList.id && middlewareConfigList.module) {
        middlewareConfigList = [middlewareConfigList];
      } else {
        let tmp = [];
        try {
          utils.sortObjectByKey(middlewareConfigList).forEach(function (key) {
            let midCfg = middlewareConfigList[key];
            midCfg.id = key;
            tmp.push(midCfg);
          });
        } catch (e) {
          return this.exit('loadMiddleware has error:' + e.message);
        }
        middlewareConfigList = tmp;
      }
    }

    let checkConfig = this.options.checkConfig;

    middlewareConfigList.forEach((midConfig) => {
      if (!midConfig.id) {
        this.exit('middleware should have an id, config:' + JSON.stringify(midConfig));
      }
      if (!midConfig.config) {
        midConfig.config = {};
      }
      if (midConfig.enable && Object.keys(checkConfig).includes(midConfig.id)) {
        let lastKey;
        let pass = checkConfig[midConfig.id].every((cfgKey) => {
          lastKey = cfgKey;
          return midConfig.config[cfgKey];
        });

        if (!pass) {
          this.exit(`middleware ${midConfig.id} config.${lastKey} is NOT set`);
        }
      }
      let origin = this.plugins.middleware[midConfig.id];
      if (origin) {
        this.exit(`middleware '${midConfig.id}' already exists: ${JSON.stringify(origin)}`);
      }
      this.plugins.middleware[midConfig.id] = midConfig;
    });
    try {
      this.plugins.middleware = utils.sortConfigByKey(this.plugins.middleware);
    } catch (e) {
      this.exit('loadMiddleware has error:' + e.message);
    }
  }

  /**
   * 根据 mid 禁用 middleware
   * @param  {String} mid
   */
  disableMiddleware(mid) {
    let middleware = this.plugins.middleware[mid];
    if (!middleware) {
      this.log.error(`disableMiddleware('${mid}') failed, no such middleware loaded`);
    } else {
      this.plugins.middleware[mid].enable = false;
    }
  }
  enableMiddleware(mid) {
    let middleware = this.plugins.middleware[mid];
    if (!middleware) {
      this.log.error(`enableMiddleware('${mid}') failed, no such middleware loaded`);
    } else {
      this.plugins.middleware[mid].enable = true;
    }
  }
  /**
   * 插入middleware
   * @param {String} mid 插入的参考系middleware id
   * @param {Object} middleware 待插入的middleware配置
   */
  insertMiddlewareBefore(mid, middleware) {
    if (!middleware.id) {
      this.exit('insertMiddlewareBefore(), param `middleware` should have property id');
    }
    this.loadMiddleware(middleware);
    if (!this.options.orderedMiddleware) {
      this.options.orderedMiddleware = Object.keys(this.plugins.middleware);
    }
    this.options.orderedMiddleware.forEach(function (n, i, a) {
      if (n === mid) {
        a.splice(i, 0, middleware.id);
      }
    });
  }
  /**
   * 加载扩展，通常是对req, res的扩展
   * @param  {Array|Object} obj 插件对象配置
   *                   - id
   *                   - module
   *                   - config
   *
   *  exports can be an  object with methods
   *  or a `function(dest, config){dest.xxx = function () {}}`
   */
  loadExtension(obj) {
    if (this.isExiting) {
      return;
    }
    let extList = [];
    let info = ['=== all mounted extensions ==='];

    if (typeof obj === 'object') {
      if (!obj.id || !obj.module) {
        try {
          let tmp = utils.sortObjectByKey(obj);
          tmp.forEach(function (key) {
            let ext = obj[key];
            ext.id = key;
            extList.push(ext);
          });
        } catch (e) {
          return this.exit('loadExtension has error:' + e.message);
        }
      } else {
        extList.push(obj);
      }
    }

    extList.forEach((obj) => {
      if (!obj.enable) {
        return;
      }
      const id = obj.id;
      const exts = this.plugins.extension;

      if (exts[id]) {
        this.log.warn(`extension '${id}' with methods '${JSON.stringify(obj.methods)}' already mounted`);
      }

      exts[id] = obj;

      if (typeof obj.module === 'string') {
        if (obj.module.startsWith('./') || obj.module.startsWith('../')) {
          obj.module = path.join(obj.base || this.root, obj.module);
        }
        obj.module = this._load(obj.module, `loading extension [${id}] exception`);
      }

      if (typeof obj.module === 'function') {
        obj.module(this, obj.config);
        info.push(utils.color('GREEN', ' ✓ ') + obj.id);
      } else {
        this.log.warn('unknow plug type in application._merge', obj);
      }
    });

    info.push('=====================');
    this.log.info('\n' + info.join('\n'));
  }
  /**
   * 挂载middleware, 此方法可以让middleware的挂载更简洁
   * @param  {Array} middlewareList 传入middleware挂载顺序， 如果不提供则根据middleware加入的先后顺序来挂载
   */
  mountMiddleWare() {
    if (this.isExiting) {
      return;
    }
    let middlewareList;
    if (this.options.orderedMiddleware) {
      middlewareList = this.options.orderedMiddleware;
      this.log.debug('mount middleware by custom order');
    } else {
      middlewareList = Object.keys(this.plugins.middleware);
      this.log.debug('mount middleware ordered by default'); // , '\n' + middlewareList.join('\n'));
    }
    let middlewares = this.plugins.middleware;
    let middlewareConfig = this.options.middleware;
    let self = this;
    let info = ['=== all mounted middlewares ==='];
    let router = this.getRouter();

    // check deadlocks
    utils.checkForDeadlocks(middlewares);

    middlewareList.forEach(function (mid) {
      const midConfig = middlewares[mid];
      if (!midConfig) {
        return log.error(`mount middleware exception, middleware '${mid}' not found`);
      }
      if (!midConfig.enable) {
        return;
      }
      const generatedMiddlewares = self.initMiddleware(midConfig, middlewares);
      generatedMiddlewares.forEach((middleware) => {
        try {
          if (midConfig.router) {
            router.use(
              midConfig.router,
              middleware
            );
          } else {
            router.use(middleware);
          }
        } catch (e) {
          self.exit('mount middleware exception, middleware:' + midConfig.id + ' ' + e.message);
        }
      });
      self.plugins.mountedMiddleware.push(midConfig.id);
      info.push(utils.color('GREEN', ' ✓ ') + (midConfig.router || '/') + ' > ' + midConfig.id);
    });

    info.push('=====================');
    self.log.info('\n' + info.join('\n'));
  }
  initMiddleware(midConfig, middlewares) {
    let self = this;
    // 配置中的 middleware config,  {id: , module, config, router}
    let mid = midConfig.id;
    // 支持middleware 继承，方便扩展
    // 当一个middleware需要出现多次时，
    // 可以通过extends来多配置
    if (midConfig.extends) {
      let tmp = middlewares[midConfig.extends];
      if (!tmp) {
        self.exit(`mount middleware exception, middleware '${mid}' extends '${midConfig.extends}' which is undefined`);
      }
      midConfig.module = tmp.module;
    }
    let id = midConfig.id;
    let type = typeof midConfig.module;
    if (Array.isArray(midConfig.module)) {
      type = 'array';
    }
    let middleware;

    if (!id) {
      self.exit('middleware config should have id: ' + JSON.stringify(midConfig));
    }
    switch (type) {
      case 'function':
        // do nothing
        middleware = midConfig.module;
        break;
      case 'string':
        // 文件路径寻址，则从appRoot开始  TODO 前面有了 prepareConfig 这个逻辑应该不会进了
        if (midConfig.module.startsWith('./') || midConfig.module.startsWith('../')) {
          midConfig.module = path.join(midConfig.base || self.root, midConfig.module);
        }
        middleware = self._load(midConfig.module, `loading middleware '${id}' exception`);
        break;
      case 'undefined':
        self.exit(`middleware '${midConfig.id}' DOES NOT have module`);
        break;
      case 'array':
        let subMids = [];
        midConfig.module.forEach(m => {
          const newMidConfig = _.mergeWith({}, middlewares[m], _.get(midConfig.config, m), (objValue, srcValue) => {
            if (_.isArray(objValue)) {
              return _.union(objValue, srcValue);
            }
          });
          const midInstances = self.initMiddleware(newMidConfig, middlewares);
          midInstances.forEach(ins => {
            if (!ins.match) {
              ins.match = function truth() {
                return true;
              };
            }
          });
          if (newMidConfig.match) {
            midInstances.forEach(midInstance => {
              midInstance.match = newMidConfig.match;
            });
          }

          subMids = subMids.concat(midInstances);
        });
        function combineMiddleware(req, res, next) {
          for (let i = 0; i < subMids.length; i++) {
            const instance = subMids[i];
            if (instance.match(req)) {
              return instance.call(null, req, res, next);
            }
          }

          self.log.warn('[hc-bee]: no middleware matched in ' + midConfig.id);
          next();
          // return res.status(400).send('not auth middleware matched.').end();;
        }
        // make combine middleware can be combined.
        combineMiddleware.match = function (req) {
          for (let i = 0; i < subMids.length; i++) {
            if (subMids[i].match(req)) {
              return true;
            }
          }
          return false;
        };
        middleware = combineMiddleware;
        break;
      default:
        self.exit(`loading middleware exception, unsupport module type '${type}' in middleware '${midConfig.id}'`);
    }

    let mds = middleware;
    if (!Array.isArray(mds)) {
      mds = [mds];
    }
    return mds.map((middleware) => {
      /**
       * 如果 middleware 不是一个方法，则直接抛出异常
       *
       * 如果 middleware 非 GeneratorFunction
       *   如果 middleware.length === 0 or 1
       *     则执行  middleware = middleware(config), 初始化中间件
       *   如果 middleware.length === 2
       *     则执行  middleware = middleware(app, config), 初始化中间件
       *   如果 middleware.length === 3
       *     则默认为是 express 的常规 middleware
       */
      if (typeof middleware !== 'function') {
        throw new Error(`middleware ${mid} module IS NOT a function`);
      }
      /**
       * middleware with config
       * @example
       *   module.exports = function (config) {
       *     return function *() {}
       *   }
       * middlewareConfig 来自用户配置的config
       * midConfig middleware的默认配置
       */
      if (middleware.constructor.name !== 'GeneratorFunction') {
        // let customCfg = middlewares[id] ? middlewares[id].config : {};
        // let cfg = _.merge({}, midConfig.config, customCfg);  // 貌似2个配置是一样的
        let cfg = _.merge({}, midConfig.config);
        switch (middleware.length) {
          case 0:
          case 1:
            middleware = middleware(cfg);
            break;
          case 2:
            middleware = middleware(self, cfg);
            break;
          default:
            break;
        }
      }
      /**
       * 注意不要调换这个if逻辑的顺序，因为前面的if逻辑中，可能得到一个generatorFunction的middleware
       */
      if (middleware.constructor.name === 'GeneratorFunction') {
        middleware = utils.wrapMiddleware(middleware);
      }

      return middleware;
    });
  }
  /**
   * 挂载应用路由, 根据各自框架的不同，可以定制
   */
  mountRouter() {
    let routerFile = path.join(this.root, './router.js');
    let autoRouterFile = path.join(this.root, './auto_router.js');
    let appRouter = this._load(routerFile, 'loading router exception', true);
    let appAutoRouter = this._load(autoRouterFile, 'loading auto_router exception', true);

    let router = this.getRouter();

    if (appRouter) {
      appRouter(router);
    }
    if (appAutoRouter) {
      try{
        appAutoRouter(router);
      }catch(e){
        console.error(e);
      }
      
    }
    // TODO: 使用统一获取route的函数而不是用if
    if (this.options.prefix) {
      if (this.express) {
        this.express.use(this.options.prefix, router);
      } else {
        this.koa.router.prefix(this.options.prefix);
      }
    } else {
      if (this.express) {
        this.express.use(router);
      } else {
        this.koa.use(koa.router.routes())
        this.koa.use(koa.router.allowedMethods())
      }
    }
  }

  getRouter() {
    //TODO wrap router
    if (this.express) {
      if (!this.router) {
        this.router = this.wrapRouter(new express.Router());
      }
    } else {
      this.router = this.koa.router
    }
    return this.router;
  }

  wrapRouter(router) {
    responseWraper.wrapJson(this.options.wrapResponseJson);
    ['get', 'post', 'delete', 'put', 'patch'].forEach(function (method) {
      let origin = router[method];
      router[method] = function (match, controllerFn, wraped) {
        let fnType = controllerFn.constructor.name;
        let wrapedFunc = utils.wrapController(controllerFn);
        if (!wraped) {
          origin.call(this, match, wrapedFunc);
        } else {
          origin.call(this, match, function (req, res, next) {
            wrapedFunc(req, responseWraper(req, res, next));
          });
        }
      };
    });
    return router;
  }

  getLog(name) {
    return this.log.get(name);
  }
  /**
   * 设置responseWraper的processor
   */
  setResponseWraperProcessor(processor) {
    responseWraper.setProcessor(processor);
  }
  /**
   * 加载模块
   * @param  {Path} fpath    模块路径
   * @param  {String} exception 异常的描述
   * @param  {Boolean} ignore    是否忽略
   * @return {Module} 返回加载的模块, 如果发生异常，返回undefined
   */
  _load(fpath, exception, ignore) {
    let mod;
    try {
      mod = require(fpath);
    } catch (e) {
      /*
         模块找不到分 3 种情况：
            1. 中间件模块没安装，提示用户安装
            2. 中间件模块内部依赖某个库没有安装，直接打印找不到模块的堆栈
            3. router.js 和 auto_router.js 文件找不到，通过第三个参数 ignore 忽略
      */
      if (e.code === 'MODULE_NOT_FOUND') {
        if (e.message.includes(`'${fpath}'`)) {
          if (ignore) {
            this.log.warn(`${exception}, ignore`);
            return null;
          }
          let msg = `\n========================ERROR========================
                     ${fpath} not been installed. please install it:
                     tnpm install --save ${fpath}
                    =====================================================`;
          this.log.error(msg.replace(/ {2}/g, ''));
        }
        this.exit(e.stack);
      } else {
        e.message = exception + ': ' + fpath + ', ' + e.stack;
        this.exit(e.message);
      }
    }
    return mod;
  }

  _print(msg, obj) {
    if (!obj) {
      return;
    }
    let info = [msg];
    info.push('=== all available middlewares ===');
    if (Array.isArray(obj)) {
      obj.forEach(function (v, i) {
        info.push('[' + i + '] ' + v);
      });
    } else if (typeof obj === 'object') {
      Object.keys(obj).forEach(function (v, i) {
        info.push('[' + i + ']' + v);
      });
    } else {
      info.push(JSON.stringify(obj, null, 2));
    }
    info.push('=============================');
    this.log.info(info.join('\n'));
  }
  _getExpressOrKoa() {
    return this.express || this.koa;
  }
}

Application.prepareConfig = utils.prepareConfig;

module.exports = Application;
