'use strict';

function compareVersion(ver1, ver2) {
  let arr1 = ver1.split('.');
  let arr2 = ver2.split('.');

  if (ver1 === ver2) {
    return 0;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return +arr1[i] > +arr2[i] ? 1 : -1;
    }
  }
}

/* es6 support see http://node.green/ */
if (compareVersion(process.versions.node, '6.5.0') < 0) {
  /*eslint-disable */
  console.error('------------------------- ERROR ---------------------------');
  console.error('Your Node.js version is too old, please upgrade to >= 6.5.0');
  console.error('-----------------------------------------------------------');
  /*eslint-enable */
  process.exit(1);
}

const Application = require('./lib/application');

module.exports = Application;
