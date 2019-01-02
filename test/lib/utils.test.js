'use strict';

const utils = require('../../lib/utils');
const debug = require('debug')('hc-bee');
const assert = require('power-assert');

describe('utils test', function () {
  describe('sortObjectByKey', function () {
    it('should not throw', () => {
      assert.doesNotThrow(() => {
        utils.sortObjectByKey(null);
        utils.sortObjectByKey();
        utils.sortObjectByKey('');
      });
    });
    it('should throw', () => {
      var loopedDeps = {
        a: {deps: 'c'},
        b: {deps: 'd'},
        c: {deps: 'a'}
      };
      try {
        utils.sortObjectByKey(loopedDeps);
      } catch (e) {
        assert.equal(e.code, 'ERR_ASSERTION');
        assert.equal(e.message, 'item added into group c created a dependencies error');
      }
    });
    it('sort object with non-exits deps', () => {
      var a = {x: {deps: ['d', 'z']}, y: '', z: {deps: ['non-exists']}, a: {}, b: {}, c: 1, d: null};
      assert.deepStrictEqual(utils.sortObjectByKey(a), ['z', 'a', 'b', 'c', 'd', 'x', 'y']);
    });
    it('sort array', () => {
      var noChange = [{}, {}, {}, {}, {}, {}];
      assert.deepStrictEqual(utils.sortObjectByKey(noChange), [0, 1, 2, 3, 4, 5]);
      var b = [{deps: [6]}, {deps: 2}, {}, 2, '', 0, NaN];
      assert.deepStrictEqual(utils.sortObjectByKey(b), [2, 1, 3, 4, 5, 6, 0]);
    });
    it('sort object by topo', () => {
      var noChange = {
        x: {},
        y: {},
        z: {},
        a: {},
        b: {},
        c: 1,
        d: null
      };
      assert.deepStrictEqual(utils.sortObjectByKey(noChange), Object.keys(noChange));
      var a = {
        x: {deps: 'y'},
        y: {deps: 'a'},
        z: {},
        a: {},
        b: {},
        c: 1,
        d: null
      };
      assert.deepStrictEqual(utils.sortObjectByKey(a), ['a', 'y', 'x', 'z', 'b', 'c', 'd']);
      var b = {
        x: {deps: ['c', 'y']},
        y: {deps: 'abc'},
        z: {id: 'abc'},
        a: {},
        b: {deps: 'd'},
        c: {deps: 'a'},
        d: {},
      };
      assert.deepStrictEqual(utils.sortObjectByKey(b), ['z', 'y', 'a', 'c', 'x', 'd', 'b']);
    });
  });
  describe('sortConfigByKey', () => {
    it('normal', () => {
      var originConfig = {
        x: {deps: 'z'},
        y: {},
        z: {}
      };
      var origin = utils.sortConfigByKey(originConfig);
      assert.deepStrictEqual(origin, {z: {}, x: {deps: 'z'}, y: {}});
    });
    it('has deps loop', () => {
      var called = false;
      var originConfig = {
        x: {deps: 'z'},
        y: {},
        z: {deps: 'x'}
      };
      try {
        utils.sortConfigByKey(originConfig);
      } catch (e) {
        called = true;
        assert.deepStrictEqual(e.message, 'item added into group z created a dependencies error');
      }
      assert.equal(called, true);
    });
    it('merge exist', () => {
      var originConfig = {
        x: {deps: ['z', 'b']},
        y: {},
        z: {}
      };
      var origin = utils.sortConfigByKey(originConfig);
      assert.deepStrictEqual(origin, {
        z: {},
        x: {deps: ['z', 'b']},
        y: {}
      });
      var added = utils.sortConfigByKey({
        a: {deps: ['y', 'd']},
        b: {deps: 'c'},
        c: {},
        d: {}
      });
      assert.deepStrictEqual(added, {
        c: {},
        b: {deps: 'c'},
        d: {},
        a: {deps: ['y',
          'd']}
      });
      Object.assign(origin, added);
      assert.deepStrictEqual(utils.sortConfigByKey(origin), {
        z: {},
        y: {},
        c: {},
        b: {deps: 'c'},
        x: {deps: ['z', 'b']},
        d: {},
        a: {deps: ['y', 'd']}
      });
    });
  });
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
      } catch (e) {
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
      } catch (e) {
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
      } catch (e) {
        assert.equal(e.message, '[hc-bee]: middlewares contain deadlock, mids: a, b, c');
      }
    });
  });
});
