'use strict';

const utils = require('../../lib/utils');
const debug = require('debug')('hc-bee');
const assert = require('power-assert');

describe('utils test', function () {
  describe('deadlock check', function () {
    it('normal middleware should have no error.', function () {
      utils.checkForDeadlocks({
        a: {
          id: 'a'
        },
        b: {
          id: 'b'
        },
        c: {
          id: 'c'
        }
      });
    });

    it('normal combine middleware should have no error.', function () {
      utils.checkForDeadlocks({
        a: {
          id: 'a'
        },
        b: {
          id: 'b',
          module: ['a']
        },
        c: {
          id: 'c',
          module: ['a', 'b']
        }
      });
    });

    it('self deadlock should trigger error.', function () {
      try {
        utils.checkForDeadlocks({
          a: {
            id: 'a',
            module: ['a']
          }
        });
      } catch(e) {
        assert.equal(e.message, '[hc-bee]: middlewares contain deadlock, mids: a');
      }
    });

    it('recursion deadlock should trigger error.', function () {
      try {
        utils.checkForDeadlocks({
          a: {
            id: 'a',
            module: ['b', 'c']
          },
          b: {
            id: 'b',
            module: ['a', 'c']
          },
          c: {
            id: 'c'
          }
        });
      } catch(e) {
        assert.equal(e.message, '[hc-bee]: middlewares contain deadlock, mids: a, b');
      }
    });

    it('long recursion deadlock should trigger error.', function () {
      try {
        utils.checkForDeadlocks({
          a: {
            id: 'a',
            module: ['b']
          },
          b: {
            id: 'b',
            module: ['c']
          },
          c: {
            id: 'c',
            module: ['a']
          }
        });
      } catch(e) {
        assert.equal(e.message, '[hc-bee]: middlewares contain deadlock, mids: a, b, c');
      }
    });
  });
});
