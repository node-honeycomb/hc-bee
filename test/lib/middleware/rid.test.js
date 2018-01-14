'use strict';

const should = require('should'); // eslint-disable-line
const app = require('../../env').app;
const supertest = require('supertest-session');

describe('rid.test.js', () => {
  describe('test middleware rid', () => {
    const request = supertest(app.address);
    it('should log trace id success', (done) => {
      request.get('/test/log_trace_id')
        .set('x-request-id', 'xxxx')  // 肉眼测试
        .expect(200)
        .expect(function (res) {
          res.body.code.should.eql('SUCCESS');
        }).end(done);
    });
  });
});
