'use strict';

const should = require('should'); // eslint-disable-line
const app = require('../../env').app;
const supertest = require('supertest-session');

describe('csrf.test.js', function () {
  describe('test middleware csrf', () => {
    const request = supertest(app.address);
    it('should setting session success', (done) => {
      let token;
      request.get('/test/test_csrf')
        .expect(200)
        .expect(function (res) {
          token = res.text;
        }).end(function () {
          request.post('/test/test_csrf')
            .set('x-csrf-token', token)
            .expect(200)
            .expect('success')
            .end(done);
        });
    });
  });
});
