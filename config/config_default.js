'use strict';

module.exports = {
  env: 'dev',
  debug: true,
  configDir: './config',
  keys: ['base_framework'],

  errorHandler: function (err, req, res, next) {
    next(err);
  },
  defaultHttpErrorCode: 500,
  /**
   * 服务的域名
   * @type {String}
   */
  serverName: '',
  /**
   * nginx场景，server段的配置参数，一般用来配置ssl参数
   * @type {Object}
   *    server: {
   *
   *    }
   *
   *    location: {
   *
   *    }
   */
  serverParam: {},
  /**
   * 服务器响应超时时间设置， 毫秒
   * @type {Number}
   */
  serverTimeout: 1000,
  /**
   * 进程退出时 等待serv.close()的超时时间
   */
  waitForExit: 10000,
  /**
   * server的配置端
   */
  honeycomb: {
    serverParam: {
      /**
       * nginx server  section
       * key: value
       */
      server: {},
      /**
       * nginx location section
       * key: value
       */
      location: {}
    }
  },
  /**
   * 是否设置json格式的返回
   * @type {Function|False}
   */
  wrapResponseJson: function (err, data, rid) {
    if (err) {
      return {
        code: err.code || 'ERROR',
        message: err.message,
        rid
      };
    } else {
      return {
        code: 'SUCCESS',
        data: data,
        rid
      };
    }
  },
  /**
   * 日志配置
   */
  logs: {
    sys: {
      level: 'DEBUG'
    }
  },
  /**
   * 是否dump出运行时的config
   * @type {Boolean}
   */
  dumpConfig: false,
  /**
   * 插件包中， package.json中的配置字段名, 默认叫framework
   * @type {String}
   */
  pluginConfigKey: 'framework',
  checkConfig: {
    cookieSession: ['secret']
  },

  // TODO 修改兼容koa的middleware
  middleware: {
    static: {
      enable: true,
      module: '../lib/middleware/static',
      router: '/assets',
      config: {
        root: ''
      }
    },
    cors: {
      enable: false,
      module: '../lib/middleware/cors',
      router: '/',
      config: {
        allowOrigins: ''
      }
    },
    timeout: {
      enable: false,
      module: '../lib/middleware/timeout',
      config: {
        timeout: '15s'
      }
    },
    referer: {
      enable: false,
      module: '../lib/middleware/referer',
      config: {}
    },
    cookieParser: {
      enable: true,
      module: '../lib/middleware/cookie_parser'
    },
    cookieSession: {
      enable: true,
      module: '../lib/middleware/cookie_session',
      config: {
        secret: ''
      }
    },
    bodyParser: {
      enable: true,
      module: '../lib/middleware/body_parser',
      config: {
        json: {
          strict: true,
          limit: 512 * 1024
        },
        urlencoded: {
          strict: true,
          limit: 512 * 1024
        }
      }
    },
    csrf: {
      enable: true,
      module: '../lib/middleware/csrf',
      config: {
        saltLength: 8,
        secretLength: 18
      }
    },
    log: {
      enable: true,
      module: '../lib/middleware/log',
      config: {}
    }
  },
  extension: {
    // TODO 修改兼容koa的extension
    redirect: {
      enable: false,
      module: '../lib/extension/redirect',
      config: {}
    },
    timer: {
      enable: false,
      module: '../lib/extension/timer'
    }
  }
};
