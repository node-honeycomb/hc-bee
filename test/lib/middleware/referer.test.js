'use strict';

const should = require('should'); // eslint-disable-line
const app = require('../../env').app;
const supertest = require('supertest-session');

describe('referer.test.js', () => {
  describe('test middleware referer', () => {
    const request = supertest(app.address);
    it('should forbidden when path ignore check', (done) => {
      request.get('/test/test_referer_ignore')
        .set('referer', 'http://taobao.com')
        .expect(404)
        .end(done);
    });

    it('should forbidden when path match and referer host ok', (done) => {
      request.get('/test/test_referer_check')
        .set('referer', 'http://taobao.com')
        .expect(404)
        .end(done);
    });

    it('should forbidden when path match and referer host ok', (done) => {
      request.get('/test/test_referer_check')
        .set('referer', 'http://www.alipay.com')
        .expect(404)
        .end(done);
    });

    it('should ok when domain illegal', (done) => {
      request.get('/test/test_referer_check_ok')
        .set('referer', 'http://abc.taobao.com')
        .expect(403)
        .end(done);
    });
  });
});
