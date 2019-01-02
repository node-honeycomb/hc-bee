const path = require('path');

process.env.HC_APP_CONFIG = JSON.stringify({
  serverRoot: './',
  appRoot: path.join(__dirname, './orderExample')
});

const app = require(path.join(__dirname, './orderExample/app'));

app.ready(true);

exports.app = app;