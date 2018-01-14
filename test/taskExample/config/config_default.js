'use strict';
const path = require('path');

module.exports = {
  /* honeybee config occupied */
  name: 'taskDemo',
  root: undefined,
  serverRoot: undefined,
  serverEnv: undefined,
  /* honeybee config end */
  debug: true,
  prefix: true,
  logs: {
    sys: {
      level: 'INFO'
    }
  },
  middleware: {
    cookieSession: {
      config: {
        secret: 'defalutSecret!PLEASE!REPLACE!'
      }
    },
    static: {
      router: '/static',
      config: {
        root: path.join(__dirname, '../static')
      }
    }
  },
  extension: {
    redirect: {
      config: {
        allowDomains: []
      }
    },
    appClient: {
      enable: false
    }
  }
};
