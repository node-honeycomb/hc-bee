'use strict';
console.log(2341234)

module.exports = {
  middleware: {
    cors: {
      deps: ['id_customMid6', 'custumMid1']
    },
    static: {
      deps: 'custumMid2'
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
      deps: 'id_customMid6',
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
      enable: true,
      module: '../middleware/mid4',
      config: {}
    },
    customMid5: {
      enable: true,
      module: '../middleware/mid5',
      config: {
        overwrite: 'mid5Config'
      }
    },
    customMid6: {
      id: 'id_customMid6',
      enable: true,
      module: '../middleware/mid6',
      config: {}
    },
  },
  extension: {
    redirect: {
      deps: 'customExt1'
    },
    customExt1: {
      enable: true,
      deps: 'timer'
    }
  }
};
