'use strict';

const should = require('should'); // eslint-disable-line
const app = require('../../env').app;
const supertest = require('supertest-session');

describe('app_version.test.js', function () {
  describe('test middleware app_version', () => {
    const request = supertest(app.address);
    it('should return current version', (done) => {
      request.get('/test/app.status')
        .expect(200)
        .expect(function (res) {
          const body = res.body;
          body.should.have.property('name', 'example');
          body.should.have.property('version', '0.0.1');
          body.should.have.property('build', 1);
        })
        .end(done);
    });

    it('should return one deps version', (done) => {
      request.get('/test/app.status')
        .query({
          dep: 'hc-proxy'
        })
        .expect(200)
        .expect(function (res) {
          const body = res.body;

          body.deps.should.have.property('hc-proxy', '^0.0.1');
        })
        .end(done);
    });

    it('should return multiple deps version', (done) => {
      request.get('/test/app.status')
        .query({
          dep: ['hc-proxy', 'litelog']
        })
        .expect(200)
        .expect(function (res) {
          const body = res.body;

          body.deps.should.have.property('hc-proxy', '^0.0.1');
          body.deps.should.have.property('litelog', '^0.0.1');
        })
        .end(done);
    });
    
  });
});
