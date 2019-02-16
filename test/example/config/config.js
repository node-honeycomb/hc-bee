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
    customMid4: {
      enable: false,
      module: '../middleware/mid4',
      config: {}
    },
    customMid5: {
      enable: false,
      module: '../middleware/mid5',
      config: {
        overwrite: 'mid5Config'
      }
    },
    customMid6: {
      enable: false,
      module: '../middleware/mid6',
      config: {}
    },
    combine1: {
      enable: true,
      router: '/test_combine1',
      module: ['customMid4', 'customMid5', 'customMid6'],
      config: {}
    },
    combine2: {
      enable: true,
      router: '/test_combine2',
      module: ['customMid4', 'customMid5', 'customMid6'],
      config: {
        customMid4: {
          config: {
            overwrite: 'combine2Mid4Config'
          }
        },
        customMid5: {
          config: {
            overwrite: 'combine2Mid5Config'
          }
        },
        customMid6: {
        }
      }
    },
    combine3: {
      router: '/test_combine3',
      enable: true,
      module: ['combine2', 'customMid6'],
      config: {
        combine2: {
          config: {
            customMid4: {
              config: {
                overwrite: 'combine3Mid4Config'
              }
            },
            customMid6: {
              config: {
                overwrite: 'combine3Mid6Config'
              }
            }
          }
        },
        customMid6: {
          match: function (req) {
            return req.url.indexOf('switchMid=midExtra') !== -1;
          },
          config: {
            overwrite: 'combine3Mid6Config(extra)'
          }
        }
      }
    },
    referer: {
      enable: true,
      config: {
        allowDomain: [
          'taobao.com',
          /.*\.alipay\.com$/
        ],
        ignore: function (req) {
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
      enable: false,
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
