'use strict';

const should = require('should'); // eslint-disable-line
const app = require('../../env').app;
const supertest = require('supertest-session');

describe('app_version.test.js', function () {
  describe('test middleware app_version', () => {
    const request = supertest(app.address);
    it('should return current version', (done) => {
      request.get('/test/__app_version__')
        .expect(200)
        .expect(function (res) {
          const body = res.body;
          body.should.have.property('name', 'example');
          body.should.have.property('version', '0.0.1');
          body.should.have.property('build', 1);
        }).end(done);
    });
  });
});
