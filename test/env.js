'use strict';
const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

fs.writeFileSync(
  path.join(__dirname, './example/config/config.js'),
  fs.readFileSync(path.join(__dirname, './example/config/config_test.js'))
);

process.env.HC_APP_CONFIG = JSON.stringify({
  serverRoot: './',
  appRoot: path.join(__dirname, './example')
});

process.on('exit', function () {
  fs.unlinkSync(path.join(__dirname, './example/config/config.js'));
});

// TODO: 需要修改 router的签名
// api-annotation/lib/router.js line 131
// routersMap[apiPath + '_' + method] = `  ${api.docInfo.disable ? '//@disabled ' : ''}router.${method}('${apiPath}', process(ctrls['${file}']${exportsFn ? '.' + exportsFn : ''}, '${security}', ${wrap}));`;

function genAutoRouter() {
  let appRoot = path.join(__dirname, './example');
  let ctrlPath = path.join(appRoot, './controller');
  let cmd = JSON.stringify(process.argv[0]) + ' ' + path.resolve(require.resolve('api-annotation'), '../bin/api-annotation.js');
  if (!fs.existsSync(ctrlPath)) {
    console.log('[WARN] controller dir not fould, ignore gen auto_router');
    return;
  }

  cmd += ' -o ' + path.join(appRoot, './auto_router.js');
  cmd += ' --api-version ' + require(path.join(appRoot, './package.json')).version;
  cmd += ' ' + ctrlPath;

  let res = execSync(cmd, {
    cwd: appRoot,
    timeout: 10000
  }).toString();

  if (/ERROR/.test(res)) {
    console.error('gen_auto_router_failed:', res);
    throw res;
  }
}

genAutoRouter();

/**
 * this file is app enter
 */
const app = require(path.join(__dirname, './example/app'));
// const app = new Honeybee({
//   root: path.join(__dirname, '../example')
// });

// app.loadMiddleware({
//   enable: true,
//   id: 'custom_inline_middleware',
//   config: {
//     name: 'custom_inline_middleware'
//   },
//   module: function (app, config) {
//     return function* (req, res, next) {
//       yield {};
//       req.testCustom = function () {
//         return config.name;
//       };
//       next();
//     };
//   }
// });

// app.loadMiddleware({
//   enable: true,
//   id: 'test_generator_middleware',
//   config: {
//     name: 'test_generator_middleware'
//   },
//   module: function (app, config) {
//     return function* (req, res, next) {
//       yield {};
//       req.testGenerator = function () {
//         return config.name;
//       };
//       next();
//     };
//   }
// });

// app.loadMiddleware({
//   enable: true,
//   id: 'name_from_config',
//   config: {
//     name: 'name_from_config'
//   },
//   module: function (app, config) {
//     return function (req, res, next) {
//       req.testWithConfig = function () {
//         return config.name;
//       };
//       next();
//     };
//   }
// });

// app.listMiddleware();

// app.sortMiddleware([
//   'static',
//   'static2',
//   'referer',
//   'cookieParser',
//   'bodyParser',
//   'csrf',
//   'log',
//   'cookieSession',
//   'custom_inline_middleware',
//   'test_generator_middleware',
//   'name_from_config',
//   'custumMid0',
//   'custumMid1',
//   'custumMid2',
//   'custumMid3',
//   'combine1',
//   'combine2',
//   'combine3'
// ]);

app.address = 'http://localhost:12345';

if (typeof before !== 'undefined') {
  before(function (done) {
    app.run(function (err) {
      if (err) {
        done(err);
      } else {
        console.log('server start up'); // eslint-disable-line
        done();
      }
    }, {port: 12345});
  });
} else {
  app.run(function (err) {
    if (err) {
      console.log(err); // eslint-disable-line
    } else {
      console.log('server start up'); // eslint-disable-line
    }
  }, {port: 12345});
}

exports.app = app;
