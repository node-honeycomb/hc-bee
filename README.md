# hc-bee
> recommended framework to develop service on honeycomb.

[![Build Status][travis-image]][travis-url]
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![snyk status][snyk-image]][snyk-url]
[![dependencies status][dependencies-image]][dependencies-url]

A application framework for building honeycomb's app
应用框架，用来构建运行在 honeycomb上的app

* 运行在honeycomb-server 上
* 自动路由
* 插件机制
* 便捷的配置
* 集成日志

## how to use

first you need install honeycomb-cli tools:

```sh
> npm i -g honeycomb-cli
```

then using honeycomb-cli init a project:

```sh
> honeycomb init demo  # this cmd will create dir named `demo` in current dir
```

`cd` into dir `demo/`, you will see the project structure as following:

```
appRoot/
       |- bin/
       |- config/
       |- middleware/
       |- controller/
       |- model/
       |- view/
       |- app.js
       |- package.json
       |- README.md
```

the package enter is ref to app.js

```
> cd demo
> make install
> honeycomb start
```

app now start

## 配置

* package.json

package.json中，以下几个字段常用
  
  * name      # app名字
  * version   # app版本, 遵循semver
  * build     # build number , 数字， [可选]
  * main      # app的入口文件, demo里是app.js, 为空则寻址index.js 寻址规则同node_modules寻址

* config/

app的config机制, 有一个很长的继承链路

```
config = {} < config/config.default.js < config/config_env.js < serverSizeConfig
```

本地开发的配置文件为 `config/config_dev.js`, 线上环境为 `config/config_production.js`

配置中的常见字段:

```
{
  serverName: '',
  port: '',
  middleware: {  // middleware插件
    midName: {
      enable: true,
      module: 'cors',
      config: {
        // config for middleware
      }
    }
  },
  extension: { // extension插件

  }
}
```

## 插件机制

根据上述config中的配置信息可知，framework定义了两种类型:

* middleware
  > middleware 主要是请求链路中的逻辑处理模块
* extension
  > extension 主要扩展  context, response, request 上的方法

插件的规则:

* 每个插件都有自己的唯一id
* 插件的配置结构如下
```
  {
    "enable": "", 
    "module": "", 
    "config": {}
  }
```


内置middleware:

* [M] cookieParser
* [M]cookieSession
* csrf
* rid
* bodyParser
* redirect allowDomains 配置
* cors 中间件的 allowDomains配置和 redirect的相同，支持 glob pattern数组

内置extension:

* jsonp
* redirect
* timer




## controller

controller约定在`controller/`目录下，框架会递归扫描目录，并自动生成路由


express风格的常规controller方法定义
```
/**
 * 简单GET接口
 * @api {get} /
 * @param req
 * @param res
 * @nowrap 
 */
exports.ctrl = function (req, res, next) {
  res.end('hello');
};

/**
 * callback形式的封装，该接口默认返回json格式
 * @api {get} /
 * @param req
 * @param callback(err, data, options)
 */
exports.ctrl = function (req, callback) {
  callback(null, {}); // default is json callback
};

/**
 * html页面形式的返回
 * @api {get} /page
 */
exports.page = function (req, callback) {
  callback(null, {
    tpl: 'index.html', // view目录中的相对路径
    data: {}           // 模板中的变量
  }, 'html'); // default is json callback
};

/**
 * POST方法的接口
 * @api {post} /
 */
exports.post = function (req, callback) {}

/**
 * 多方法的接口
 * @api {post|patch|delete} /
 */
exports.post = function (req, callback) {}
```


generator写法(语法和常规写法兼容)：

```
/**
 * @api {get} /
 */
exports.ctrl = function* (req) {
  /**
   * 该模式兼容上述常规写法，只是支持controller方法使用yield
   * 同时新增以下语法支持：
   *  1. 异常直接throw
   *  2. return直接返回数据
   */
  if (req.url === '/exception') {
    throw new Error('error object');
  } else {
    return dataObj;  // 请求正常，返回正常的数据对象， 等同于 callback(null, dataObj);
  }
}
/**
 * @api {get} /
 */
exports.ctrl = function* (req, callback) {
  callback(null, data, opt);
}
```

async写法(同genFun，兼容常规写法):

```
/**
 * @api {get} /
 * @param req
 */
exports.ctrl = async function (req) {
  if (req.url === '/exception') {
    new Error('error object');
  } else {
    return dataObj;  // 请求正常，返回正常的数据对象， 等同于 callback(null, dataObj);
  }
}
```

[travis-image]: https://api.travis-ci.org/node-honeycomb/hc-bee.svg
[travis-url]: https://travis-ci.org/node-honeycomb/hc-bee
[npm-image]: https://img.shields.io/npm/v/hc-bee.svg
[npm-url]: https://npmjs.org/package/hc-bee
[downloads-image]: https://img.shields.io/npm/dm/hc-bee.svg
[downloads-url]: https://npmjs.org/package/hc-bee
[snyk-image]: https://snyk.io/test/github/node-honeycomb/hc-bee/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/github/node-honeycomb/hc-bee
[dependencies-image]: https://david-dm.org/node-honeycomb/hc-bee/status.svg
[dependencies-url]: https://david-dm.org/node-honeycomb/hc-bee

