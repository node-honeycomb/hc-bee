'use strict';

const should = require('should'); // eslint-disable-line
const app = require('../../env').app;
const supertest = require('supertest-session');

describe('redirect.test.js', () => {
  describe('test extension redirect', () => {
    const request = supertest(app.address);
    it('should redirect success', (done) => {
      request.get('/test/test_redirect')
        .expect(302)
        .expect(function (res) {
          res.headers.location.should.eql('/test_redirect_success');
        }).end(done);
    });

    it('should redirect failed, and forbidden', (done) => {
      request.get('/test/test_redirect_illegal')
        .expect(403)
        .expect(function (res) {
          res.text.should.eql('forbidden, stop redirecting to unknow host');
        }).end(done);
    });

    it('should redirect glob pattern domain success', (done) => {
      request.get('/test/test_redirect_glob')
        .expect(302)
        .expect(function (res) {
          res.headers.location.should.eql('http://www.aliyun.com/test_redirect_success');
        }).end(done);
    });

    it('should redirect full match domain success', (done) => {
      request.get('/test/test_redirect_full_match')
        .expect(302)
        .expect(function (res) {
          res.headers.location.should.eql('http://test.alibaba.com/test_redirect_success');
        }).end(done);
    });

    it('should redirect illegal glob domain failed, and forbidden', (done) => {
      request.get('/test/test_redirect_glob_match_illegal')
        .expect(403)
        .expect(function (res) {
          res.text.should.eql('forbidden, stop redirecting to unknow host');
        }).end(done);
    });
  });
});
