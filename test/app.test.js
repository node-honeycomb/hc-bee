'use strict';

const path = require('path');
const should = require('should'); // eslint-disable-line
const supertest = require('supertest');
const app = require('./env').app;
const assert = require('power-assert');
const debug = require('debug')('hc-bee');

describe('app.test.js', () => {
  describe('test config merge', () => {
    it('should merge config fine', () => {
      /**
       * app的配置最高优先级别
       * 定制的framework其次
       * framework-base 最低优先级
       */
      let finalConfig = app.options;
      finalConfig.port.should.eql(12345);
      finalConfig.root.should.eql(path.join(__dirname, './example'));
      finalConfig.middleware.cookieSession.config.secret.should.eql('hello_the_world');
    });
  });

  describe('test middleware loading', () => {
    const request = supertest(app.address);
    it('test custom_framework middleware should work fine', (done) => {
      request.get('/test/test_middleware?q=testGenerator')
        .expect(200)
        .expect('test_generator_middleware')
        .end(done);
    });
    it('test custom_framework middleware should work fine 2', (done) => {
      request.get('/test/test_middleware?q=testWithConfig')
        .expect(200)
        .expect('name_from_config')
        .end(done);
    });
    it('test custom middleware should work fine', (done) => {
      request.get('/test/test_middleware?q=testCustom')
        .expect(200)
        .expect('custom_inline_middleware')
        .end(done);
    });
  });

  describe('test extension loading', () => {});

  describe('test middleware extends', () => {
    const request = supertest(app.address);
    it('should work fine', function (done) {
      request.get('/test/static2/index.html')
        .expect(200)
        .expect(/hello/)
        .end(done);
    });
  });

  describe('test exception', function () {
    const request = supertest(app.address);
    it('should response error', function (done) {
      request.get('/test/exception')
        .expect(500)
        .expect(/code: .*,\nmessage: .*/)
        .end(done);
    });
    it('should response error', function (done) {
      request.get('/test/hi/%ff.%ff./%ff.%ff./%ff.%ff./%ff.%ff./%ff.%ff./%ff.%ff./usr/share/zoneinfo/zone.tab?m=1&1=')
        .expect(400)
        .expect(/code: .*,\nmessage: .*/)
        .end(done);
    });
  });

  describe('test callback error', function () {
    const request = supertest(app.address);
    it('should response error', function (done) {
      request.get('/test/callback_error')
        .set('x-request-id', 'idddddddddddd')
        .expect(500)
        .expect('Content-Type', /json/)
        .expect('{"code":"ERROR","message":"custom_error","rid":"idddddddddddd"}')
        .end(done);
    });
  });

  describe('test callback error 403', function () {
    const request = supertest(app.address);
    it('should response error', function (done) {
      request.get('/test/callback_error_403')
        .expect(403)
        .expect('Content-Type', /json/)
        .end(done);
    });
  });

  describe('test callback error 404', function () {
    const request = supertest(app.address);
    it('should response error', function (done) {
      request.get('/test/callback_error_404')
        .expect(404)
        .expect('Content-Type', /json/)
        .end(done);
    });
  });

  describe('test callback error Error', function () {
    const request = supertest(app.address);
    it('should response error', function (done) {
      request.get('/test/callback_error_err')
        .set('x-request-id', 'idddddddddddd')
        .expect(500)
        .expect('Content-Type', /json/)
        .expect('{"code":"ERROR","message":"custom_error","rid":"idddddddddddd"}')
        .end(done);
    });
  });

  describe('test callback error throw', function () {
    const request = supertest(app.address);
    it('should response error', function (done) {
      request.get('/test/callback_error_throw')
        .set('x-request-id', 'idddddddddddd')
        .expect(500)
        .expect(/code: ERROR,\nmessage: custom_error,\nrid: idddddddddddd/)
        .end(done);
    });
  });

  describe('test controller', function () {
    const request = supertest(app.address);
    it('should work fine with controller callback', function (done) {
      request.get('/test/ctrl')
        .set('x-request-id', 'idddddddddddd')
        .expect(200)
        .expect(/{"code":"SUCCESS","data":.*,"rid":"idddddddddddd"}/)
        .end(done);
    });
  });

  describe('test router', function () {
    const request = supertest(app.address);
    it('should work fine with generator function ctrl', function (done) {
      request.get('/test/test_gen_ctrl')
        .expect(200)
        .expect('success')
        .end(done);
    });

    it ('should error in middleware response correctly.', function (done) {
      request.get('/test/test_err_middleware')
        .expect(500)
        .expect(/code: .*,\nmessage: .*/)
        .end(done);
    });

    it ('should error in middleware response correctly.', function (done) {
      request.get('/test/test_err_middleware')
        .set('Accept', 'application/json')
        .expect(500)
        .expect((res) => {
          res.body.should.eql({
            code: 'ERR_GEN_MIDDLEWARE',
            message: 'err_message'
          });
        })
        .end(done);
    });

    it('should work fine with async function ctrl 1', function (done) {
      request.get('/test/test_async_func1/ok')
        .expect(200)
        .expect((res) => {
          res.body.should.eql({
            code: 'SUCCESS',
            data: 'ok'
          })
        })
        .end(done);
    });
    it('should work fine with async function ctrl 1 when error occur', function (done) {
      request.get('/test/test_async_func1/error')
        .expect(500)
        .expect({
          code: 'ERROR',
          message: 'async_error'
        })
        .end(done);
    });

    it('should work fine with async function ctrl 2', function (done) {
      request.get('/test/test_async_func2/ok')
        .expect(200)
        .expect((res) => {
          res.body.should.eql({
            code: 'SUCCESS',
            data: 'ok'
          })
        })
        .end(done);
    });
    it('should work fine with async function ctrl 2 when error occur', function (done) {
      request.get('/test/test_async_func2/error')
        .expect(500)
        .expect({
          code: 'ERROR',
          message: 'async_error'
        })
        .end(done);
    });

    it('should work fine with async function ctrl 3', function (done) {
      request.get('/test/test_async_func2/ok')
        .expect(200)
        .expect((res) => {
          res.body.should.eql({
            code: 'SUCCESS',
            data: 'ok'
          })
        })
        .end(done);
    });
    it('should work fine with async function ctrl 3 when error occur', function (done) {
      request.get('/test/test_async_func2/error')
        .expect(500)
        .expect({
          code: 'ERROR',
          message: 'async_error'
        })
        .end(done);
    });
  });

  describe('combine middleware test', function () {
    const request = supertest(app.address);
    describe('combine1', function () {
      it('switch no middleware', function (done) {
        request.get('/test/test_combine1')
          .expect(200)
          .expect((res) => {
            assert.equal(res.text, ' testCombine1');
          })
          .end(done);
      });

      it('switch mid4 middleware', function (done) {
        request.get('/test/test_combine1?switchMid=mid4')
          .expect(200)
          .expect((res) => {
            assert.equal(res.text, 'mid4Default testCombine1');
          })
          .end(done);
      });

      it('switch mid5 middleware', function (done) {
        request.get('/test/test_combine1?switchMid=mid5')
          .expect(200)
          .expect((res) => {
            assert.equal(res.text, 'mid5Config testCombine1');
          })
          .end(done);
      });

      it('switch mid6 middleware', function (done) {
        request.get('/test/test_combine1?switchMid=mid6')
          .expect(200)
          .expect((res) => {
            assert.equal(res.text, 'mid6Default testCombine1');
          })
          .end(done);
      });
    });

    describe('combine2', function () {
      it('switch mid4', function (done) {
        request.get('/test/test_combine2?switchMid=mid4')
          .expect(200)
          .expect((res) => {
            assert.equal(res.text, 'combine2Mid4Config testCombine2');
          })
          .end(done);
      });

      it('switch mid5', function (done) {
        request.get('/test/test_combine2?switchMid=mid5')
          .expect(200)
          .expect((res) => {
            assert.equal(res.text, 'combine2Mid5Config testCombine2');
          })
          .end(done);
      });

      it('switch mid6', function (done) {
        request.get('/test/test_combine2?switchMid=mid6')
          .expect(200)
          .expect((res) => {
            assert.equal(res.text, 'mid6Default testCombine2');
          })
          .end(done);
      });
    });

    describe('combine3', function () {
      it('switch mid4', function (done) {
        request.get('/test/test_combine3?switchMid=mid4')
          .expect(200)
          .expect((res) => {
            assert.equal(res.text, 'combine3Mid4Config testCombine3');
          })
          .end(done);
      });

      it('switch mid5', function (done) {
        request.get('/test/test_combine3?switchMid=mid5')
          .expect(200)
          .expect((res) => {
            assert.equal(res.text, 'combine2Mid5Config testCombine3');
          })
          .end(done);
      });

      it('switch mid6', function (done) {
        request.get('/test/test_combine3?switchMid=mid6')
          .expect(200)
          .expect((res) => {
            assert.equal(res.text, 'combine3Mid6Config testCombine3');
          })
          .end(done);
      });

      it('switch midExtra', function (done) {
        request.get('/test/test_combine3?switchMid=midExtra')
          .expect(200)
          .expect((res) => {
            assert.equal(res.text, 'combine3Mid6Config(extra) testCombine3');
          })
          .end(done);
      });
    });

    describe('`stream` mode proxy statusCode', function () {
      it('created statusCode', function (done) {
        request.get('/test/testCreated')
          .expect(201)
          .expect((res) => {
            assert.equal(res.text, 'created');
          })
          .end(done);
      });

      it('proxy created statusCode', function (done) {
        request.get('/test/testProxyStatusCode201')
          .expect(201)
          .expect((res) => {
            assert.equal(res.text, 'created');
          })
          .end(done);
      });
    });
    describe('test `res.json` error', function () {
      it('test `res.json` error', function (done) {
        request.get('/test/testResJsonError')
          .expect(500)
          .expect('{"code":"TYPEERROR","message":"Converting circular structure to JSON"}')
          .end(done);
      });
    });
  });
});
