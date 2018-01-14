'use strict';

const should = require('should'); // eslint-disable-line
const app = require('../../env').app;
const supertest = require('supertest-session');
const cors = require('../../../lib/middleware/cors');

var fakeRequest = function (headers) {
  return {
    headers: headers || {
      'origin': 'request.com',
      'access-control-request-headers': 'requestedHeader1,requestedHeader2'
    },
    pause: function () {
      // do nothing
      return;
    },
    resume: function () {
      // do nothing
      return;
    },
    get: function (key) {
      return headers[key];
    }
  };
};
var fakeResponse = function (done) {
  var headers = {};
  return {
    allHeaders: function () {
      return headers;
    },
    getHeader: function (key) {
      return headers[key];
    },
    setHeader: function (key, value) {
      headers[key] = value;
      return;
    },
    get: function (key) {
      return headers[key];
    }
  };
};

describe('cors.test.js', function () {
  it('should be a function', function () {
    cors({}, {}).should.be.type('function');
  });

  it('should have three params', function () {
    cors({}, {}).length.should.be.equal(3);
  });

  it('should have allow-origin header', function (done) {
    var req, res, next, config;
    config = {
      allowOrigins: ['**.aliyun.com']
    };
    req = fakeRequest({
      origin: 'abc.aliyun.com'
    });
    res = fakeResponse();
    next = function () {
      // assert
      should.exist(res.getHeader('Access-Control-Allow-Origin'));
      res.getHeader('Access-Control-Allow-Origin').should.equal('abc.aliyun.com');
      done();
    };
    cors({}, config)(req, res, next);
  });

  it('should not have allow-origin header', function (done) {
    var req, res, next, config;
    config = {
      allowOrigins: ['**.aliyun.com']
    };
    req = fakeRequest({
      origin: 'abc.alibaba.com'
    });
    res = fakeResponse();
    next = function () {
      // assert
      should.not.exist(res.getHeader('Access-Control-Allow-Origin'));
      done();
    };
    cors({}, config)(req, res, next);
  });

  it('should have allow-method header', function (done) {
    var req, res, next, config;
    config = {
      allowOrigins: ['**.aliyun.com']
    };
    req = fakeRequest({
      origin: 'abc.aliyun.com'
    });
    req.method = 'OPTIONS';
    res = fakeResponse();
    res.end = function () {
      // assert
      should.exist(res.getHeader('Access-Control-Allow-Origin'));
      should.exist(res.getHeader('Access-Control-Allow-Methods'));
      done();
    };
    cors({}, config)(req, res, next);
  });
});
