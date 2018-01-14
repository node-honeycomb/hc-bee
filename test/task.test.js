'use strict';

const path = require('path');
const should = require('should'); // eslint-disable-line
const supertest = require('supertest');
const task = require('./taskEnv').app;

describe('task.test.js', () => {
  describe('test config merge', () => {
    it('should merge config fine', () => {
      let finalConfig = task.config;
      // console.log(finalConfig);
      finalConfig.name.should.eql('taskDemo');
      finalConfig.root.should.eql(path.join(__dirname, './taskExample'));
    });
  });

});
