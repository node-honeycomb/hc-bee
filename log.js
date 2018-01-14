'use strict';
const litelog = require('litelog');

//获取打印日志的位置
function getPos(fix) {
  var stack = new Error().stack.split('\n');
  var line = stack[fix];
  var lastSpace = line.lastIndexOf(' ');
  line = line.substring(lastSpace + 1, line.length);
  if (line[0] === '(') {
    line = line.substring(1, line.length - 1);
  }
  return line;
}

var mockLog = {
  _called: false,
  messageInfoCache: [],
  logLevels: ['debug', 'trace', 'info', 'warn', 'error', 'fatal'],
  logInstance: {},
  get: function (name) {
    name = name || 'sys';
    if (!this.logInstance[name]) {
      this.logInstance[name] = {
        _log: (...args) => {
          this.messageInfoCache.push(args);
        }
      };
      this.logLevels.forEach((level) => {
        this.logInstance[name][level] = function (...args) {
          //获取 log 的打印位置，和打印的内容
          var pos = getPos(3);
          args.unshift(litelog.getTime());
          this._log(name, level.toUpperCase(), args, pos);
        };
      });
      // alias
      this.logInstance[name].log = this.logInstance[name].info;
      this.logInstance[name].err = this.logInstance[name].error;
      this.logInstance[name].warning = this.logInstance[name].warn;

      // bind(this), 所有的 get 返回的都是 logInstance的成员
      this.logInstance[name].get = this.get.bind(this);
    }
    return this.logInstance[name];
  }
};

function exit() {
  mockLog.messageInfoCache.forEach(function (v) {
    let time  = '';
    if (Array.isArray(v[2])) {
      time = v[2].shift();
      v[2] = v[2].join(' ');
    }
    console.log.apply(console, [time, '[' + v[1] + ']', v[0],  v[2], '(' + v[3] + ')']);
  });
}

process.on('exit', exit);

//返回的是一个 function，根据 name 返回 log对象
var mockLogFunc = function (name) {
  return mockLog.get(name);
};
//无需执行，mockLogFunc就和 mockLogFunc.get('sys')有一样的方法
mockLogFunc.__proto__ = mockLog.get('sys');

module.exports = mockLogFunc;

module.exports.init = (opt, debug) => {
  litelog.Logger.prototype.log = litelog.Logger.prototype.info;
  litelog.Logger.prototype.err = litelog.Logger.prototype.error;
  litelog.Logger.prototype.warning = litelog.Logger.prototype.warn;
  let log = litelog.create(opt);
  if (log.colorful) {
    log.colorful(debug);
  }

  if (!log.debug || !log.info || !log.warn || !log.error) {
    throw new Error('log should have method: debug, info, warn, error');
  }

  //初始化完毕后调用真正的 log 对象打印之前保存的 log 信息
  if (mockLog.messageInfoCache.length > 0) {
    mockLog.messageInfoCache.forEach((messageInfo) => {
      //messageInfo[0]是 log 对象的名字，如果实际的 log对象中没有，就是 sys
      if (Array.isArray(messageInfo[2])) {
        messageInfo[2].shift();
      }
      log.get(messageInfo[0])._log(messageInfo[1].toUpperCase(), messageInfo[2], messageInfo[3]);
    });
    // clean cache info
    mockLog.messageInfoCache = [];
  }
  process.removeListener('exit', exit);
  //如果存在初始化完成之前的 log 对象，需要把这些对象的所有方法替换成真正的 log 对象的方法
  Object.keys(mockLog.logInstance).forEach((name) => {
    let oldLog = mockLog.logInstance[name];
    let newLog = log.get(name);
    mockLog.logLevels.forEach((level) => {
      oldLog[level] = (...args) => {
        newLog._log(level, args);
      }
    });
  });

  module.exports = (name) => {
    if (name) {
      return log.get(name);
    }
    return log;
  };

  module.exports.__proto__ = log;

  module.exports.init = () => {
    throw new Error('log has been initialized, can\'t be initialized again.');
  };
  return log;
};
