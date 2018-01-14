'use strict';

const should = require('should'); // eslint-disable-line
const app = require('../../env').app;
const supertest = require('supertest-session');

describe('static.test.js', () => {
  describe('test middleware static', () => {
    const request = supertest(app.address);
    it('should setting session success', (done) => {
      request.get('/test/assets/index.html')
        .expect(/hello/)
        .end(done);
    });
  });
});
