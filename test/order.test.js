'use strict';

const should = require('should'); // eslint-disable-line

describe('order.test.js', () => {
  const app = require('./orderEnv').app;
  describe('test config oerder', () => {
    it('should middleware order fine', () => {
      should(Object.keys(app.plugins.middleware))
        .deepEqual([
          'custumMid2',
          'static',
          'custumMid3',
          'customMid4',
          'customMid5',
          'customMid6',
          'custumMid1',
          'cors',
          'timeout',
          'referer',
          'cookieParser',
          'cookieSession',
          'bodyParser',
          'csrf',
          'log',
          'custumMid0'
        ]);
    });
    it('should extension order fine', () => {
      should(Object.keys(app.plugins.extension))
        .deepEqual([
          'timer',
          'customExt1',
          'redirect'
        ]);
    });
  });
});
