'use strict';

const should = require('should'); // eslint-disable-line
const app = require('../../env').app;
const supertest = require('supertest-session');

function getBody (length) {
  var str = '';
  while(length--){
    str += 'a';
  }
  return str;
}

describe('bodyParser.test.js', function () {
  describe('test middleware bodyParser', () => {
    const request = supertest(app.address);
    it('send appropriate body', (done) => {
      let token;
      request.get('/test/test_csrf')
        .expect(200)
        .expect(function (res) {
          token = res.text;
        }).end(function () {
          request.post('/test/test_body_parser')
            .set('x-csrf-token', token)
            .send({
              name: 'Mike'
            })
            .expect(200)
            .expect('success')
            .end(done);
        });
    });

    it('send large body less than limitation in urlencoded', (done) => {
      let token;
      request.get('/test/test_csrf')
        .expect(200)
        .expect(function (res) {
          token = res.text;
        }).end(function () {
          request.post('/test/test_body_parser')
            .set('x-csrf-token', token)
            .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
            .send(getBody(512*1024))
            .expect(200)
            .expect('success')
            .end(done);
        });
    });

    it('send too large urlencoded body', (done) => {
      let token;
      request.get('/test/test_csrf')
        .expect(200)
        .expect(function (res) {
          token = res.text;
        }).end(function () {
          request.post('/test/test_body_parser')
            .set('x-csrf-token', token)
            .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
            .send(getBody(512*1024+1))
            .expect(413)
            .end(done);
        });
    });

    it('send large body less than limitation in json', (done) => {
      let token;
      request.get('/test/test_csrf')
        .expect(200)
        .expect(function (res) {
          token = res.text;
        }).end(function () {
          request.post('/test/test_body_parser')
            .set('x-csrf-token', token)
            .send({
              name: getBody(511*1024)
            })
            .expect(200)
            .expect('success')
            .end(done);
        });
    });

    it('send too large json body', (done) => {
      let token;
      request.get('/test/test_csrf')
        .expect(200)
        .expect(function (res) {
          token = res.text;
        }).end(function () {
          request.post('/test/test_body_parser')
            .set('x-csrf-token', token)
            .set('Content-Type', 'application/json; charset=UTF-8')
            .send({
              name: getBody(512*1024)
            })
            .expect(413)
            .end(done);
        });
    });
  });
});
