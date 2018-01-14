'use strict';

const should = require('should'); // eslint-disable-line
const app = require('../../env').app;
const supertest = require('supertest-session');

describe('timer.test.js', () => {
  describe('test extension time', () => {
    const request = supertest(app.address);
    it('should setting session success', (done) => {
      request.get('/test/time')
        .expect(200)
        .expect(function (res) {
          res.body.data.should.eql('ok');
        }).end(done);
    });
  });
});
