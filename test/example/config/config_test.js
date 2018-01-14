'use strict';

const path = require('path');

module.exports = {
  port: 12345,
  prefix: '/test',
  logs: {
    sys: {
      file: path.join(__dirname, '../logs/sys.log')
    }
  },
  middleware: {
    static2: {
      enable: true,
      extends: 'static',
      config: {
        root: path.join(__dirname, '../assets')
      },
      router: '/static2'
    },
    cookieSession: {
      config: {
        secret: 'hello_the_world'
      }
    },
    custumMid0: {
      enable: true,
      module: '../middleware/mid0'
    },
    custumMid1: {
      enable: true,
      module: '../middleware/mid1'
    },
    custumMid2: {
      enable: true,
      module: '../middleware/mid2'
    },
    custumMid3: {
      enable: true,
      module: '../middleware/mid3',
      config: {}
    },
    referer: {
      enable: true,
      config: {
        allowDomain: [
          'taobao.com',
          /.*\.alipay\.com$/
        ],
        match: function (req) {
          // true 表示无需检查referer
          // false 表示需要检查referer
          if (/test_referer_ignore/.test(req.path)) {
            return false;
          } else {
            return true;
          }
        }
      }
    }
  },
  extension: {
    redirect: {
      enable: true,
      config: {
        allowDomains: [
          'localhost',
          '*.aliyun.com',
          'test.alibaba.com'
        ]
      }
    }
  }

};
