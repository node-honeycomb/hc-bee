'use strict';

const should = require('should'); // eslint-disable-line
const app = require('../../env').app;
const supertest = require('supertest-session');

describe('cookie_session.test.js', function () {
  describe('test middleware cookie_session', () => {
    const request = supertest(app.address);
    it('should setting session success', (done) => {
      request.get('/test/test_cookie_session?action=set&data=123456')
        .expect(200)
        .expect('success')
        .end(done);
    });
    it('should get session setted by last query', (done) => {
      request.get('/test/test_cookie_session?action=get')
        .expect(200)
        .expect('session.123456')
        .end(done);
    });
  });
});
