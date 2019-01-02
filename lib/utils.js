'use strict';

const path = require('path');
const co = require('co');
const _ = require('lodash');
const Topo = require('topo');
const debug = require('debug')('hc-bee');
const colors = {
  BLUE: 36,
  GREEN: 32,
  DBLUE: 34,
  YELLOW: 33,
  RED: 31,
  DRED: 35
};

/**
 * Sort Object or Array by deps key(default .deps), fallback to original key order
 * @param {Object|Array} target The target Object|Array to be sorted
 * @returns {Array} Array of string|number, sorted keys in target
 */
function sortObjectByKey(target) {
  if (!target) return [];
  const arr = Array.isArray(target) ?
    target.map((object, index) => ({key: index, index, object: object || {}})) :
    Object.keys(target).map((key, index) => ({key, index, object: target[key] || {}}));
  // sort by topo
  const topo = new Topo();
  let allDeps = arr.reduce((acc, x) => acc.concat(x.object.deps), []);
  const hasDeps = (item) => {
    if (item.object.deps != null) return true;
    return allDeps.some(x => x == item.group);
  };
  arr.forEach((item, i) => {
    let object = item.object;
    item.group = object.id || item.key;
    if (i > 0 && !hasDeps(item)) {
      allDeps.push(item.after = arr[i - 1].group);
    } else {
      item.after = item.object.deps;
    }
    topo.add(item.key, item);
  });
  return topo.nodes;
}
exports.sortObjectByKey = sortObjectByKey;

/**
 * Sort config by deps key and return sorted result
 * @param {Array|Object} target the target to be sorted
 * @returns {Array|Object} the sorted result
 */
exports.sortConfigByKey = function (target) {
  const isArray = Array.isArray(target);
  const result = isArray ? [] : {};
  sortObjectByKey(target).forEach((key) => {
    isArray ?
      result.push(target[key]) :
      result[key] = target[key];
  });
  return result;
};

/**
 * 获取从环境变量过来的私有配置
 */
exports.getPrivateConfig = function () {
  let globalConfig = {config: {}};
  try {
    globalConfig = JSON.parse(process.env.HC_APP_CONFIG);
  } catch (e) {
    e.message = '[ERROR] get global config from env.HC_APP_CONFIG failed';
    throw e;
  }
  // remove end `/`
  if (globalConfig.serverRoot.endsWith(path.sep)) {
    globalConfig.serverRoot = globalConfig.serverRoot.substr(0, globalConfig.serverRoot.length - 1);
  }
  return globalConfig;
};

exports.color = function (type, info) {
  var head = '\x1B[';
  var foot = '\x1B[0m';
  var cc = colors[type] + 'm';
  return head + cc + info + foot;
};
/**
 *  wrapMiddleware 封装老的传统的middleware
 */
exports.wrapMiddleware = function (genFunc) {
  return function (req, res, next) {
    co(function* () {
      yield* genFunc(req, res, next);
    }).catch(function (e) {
      next(e);
    });
  };
};
/**
 * 封装controller, 使框架支持genFunc、asyncFunc
 */
exports.wrapController = function (fn) {
  let fnType = fn.constructor.name;
  if (fnType === 'Function') {
    return fn;
  } else if (fnType === 'GeneratorFunction') {
    if (fn.length === 1) {
      /**
       * exports.ctrl = function * (req) {
       *   return [err], err, data, [err, data];
       * }
       */
      return function (req, callback) {
        co(function* () {
          let v = yield* fn(req);
          if (Array.isArray(v) && v[0] instanceof Error) {
            callback(v[0], v[1]);
          } else if (v instanceof Error) {
            callback(v);
          } else {
            callback(null, v);
          }
        }).catch(function (e) {
          callback(e);
        });
      };
    } else if (fn.length === 2) {
      /**
       * exports.ctrl = function * (req, callback) {}
       */
      return function (req, callback) {
        co(function* () {
          yield* fn(req, callback);
        }).catch(function (e) {
          callback(e);
        });
      };
    } else {
      /**
       * exports.ctrl = function * (req, res, next) {}
       */
      return this.wrapMiddleware(fn);
    }
  } else if (fnType === 'AsyncFunction') {
    if (fn.length === 1) {
      /**
       * exports.ctrl = async function (req) {
       *   return data;
       * }
       */
      return function (req, callback) {
        Promise.resolve(fn(req)).then(
          function (v) {
            if (v instanceof Error) {
              callback(v);
            } else {
              callback(null, v);
            }
          }
        ).catch(callback);
      };
    } else if (fn.length === 2) {
      /**
       * exports.ctrl = async function (req, callback) {
       *   callback();
       * }
       */
      return function (req, callback) {
        Promise.resolve(fn(req, callback)).catch(callback);
      };
    } else {
      return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
      };
    }
  } else {
    throw new Error('unknow type of function, ' + fn.toString());
  }
};

/**
 * 初始化配置项，有些需要初始化的配置：
 *
 *   比如： 在app的配置中，插件的配置，
 *
 * @param {Object} config
 * @param {Path} base
 */
exports.prepareConfig = function (config, base) {
  let list = ['middleware', 'extension'];
  if (!base) {
    throw new Error('prepareConfig(config, base), param `base` should not empty');
  }
  list.forEach(function (n) {
    let tmp = config[n];
    if (!tmp) {
      return;
    }
    let ll = [];
    if (typeof tmp === 'object') {
      Object.keys(tmp).forEach(function (key) {
        ll.push(tmp[key]);
      });
    }
    ll.forEach(function (cfg) {
      if (!cfg || typeof cfg.module !== 'string') {
        return;
      }
      // relative path, should be resolve to abs path
      if (/^\.\.?\//.test(cfg.module)) {
        cfg.module = path.join(base, cfg.module);
      }
    });
  });
};


exports.processVars = function (config, g, depth) {
  let type = typeof config;

  if (config === null) {
    return null;
  }
  if (depth === undefined) {
    depth = 0;
  }
  if (depth >= 1000) {
    throw new Error('app config object recursive, please check the config object');
  }
  switch (type) {
    case 'object':
      if (Array.isArray(config)) {
        config.forEach(function (v, i, a) {
          a[i] = exports.processVars(v, g, depth++);
        });
      } else {
        Object.keys(config).forEach(function (key) {
          let tmp = config[key];
          config[key] = exports.processVars(tmp, g, depth++);
        });
      }
      break;
    case 'string':
      config = config.replace(/\$\{(\w+)\}/g, function (m0, m1) {
        let v = g[m1];
        if (!v) {
          console.log('[WARNING] Global Var Not Found: variable `' + m1 + '` not found'); // eslint-disable-line
          v = m0;
        }
        return v;
      });
      break;
  }
  return config;
};

exports.code = {
  200: 'OK',
  201: 'CREATED',
  204: 'NO_CONTENT',
  400: 'INVALID_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  406: 'NOT_ACCEPTABLE',
  500: 'INTERNAL_SERVER_ERROR'
};

exports.map = {
  UNAUTHORIZED: 401,
  'NOT FOUND': 404,
  FORBIDDEN: 403,
  ERROR: 500,
  URIERROR: 400, // URI 不合法
  PAYLOADTOOLARGEERROR: 413 // 实体太大
};

exports.checkForDeadlocks = function (middlewareMap) {
  const middlewares = Object.keys(middlewareMap).map(mid => (middlewareMap[mid]));
  // Kahn's algorithm, Topological Sorting.
  // https://en.wikipedia.org/wiki/Topological_sorting#Kahn.27s_algorithm
  // http://connalle.blogspot.com/2013/10/topological-sortingkahn-algorithm.html
  const remainDependencyCount = {};
  const dependenciesMap = {};
  middlewares.forEach(m => {
    if (Array.isArray(m.module)) {
      const deps = _.uniq(m.module);
      remainDependencyCount[m.id] = deps.length;
      dependenciesMap[m.id] = deps;
    } else {
      remainDependencyCount[m.id] = 0;
      dependenciesMap[m.id] = [];
    }
  });
  let remainMids = middlewares.map(m => (m.id));
  let toRemoveMids = [];
  while (remainMids.length > 0) {
    toRemoveMids = [];
    remainMids.forEach(mid => {
      if (remainDependencyCount[mid] === 0) {
        toRemoveMids.push(mid);
      }
    });

    if (!toRemoveMids.length) {
      break;
    }

    remainMids = remainMids.filter(mid => {
      return toRemoveMids.indexOf(mid) === -1;
    });
    toRemoveMids.forEach(toRemoveMid => {
      remainMids.forEach(remainMid => {
        if (dependenciesMap[remainMid].indexOf(toRemoveMid) !== -1) {
          remainDependencyCount[remainMid] = remainDependencyCount[remainMid] - 1;
        }
      });
    });
  }

  if (remainMids.length) {
    throw new Error('[hc-bee]: middlewares contain deadlock, mids: ' + remainMids.join(', '));
  }
};
