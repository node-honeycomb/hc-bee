'use strict';
let processor = null;
let wrapJson = null;
let mimes = {
  json: 'application/json',
  jsonp: 'text/script',
  xml: 'application/xml',
  html: 'text/html',
  csv: 'text/csv'
};

module.exports = function (req, res, next) {
  return function (err, data, opt) {
    let type;
    if (typeof opt === 'object') {
      type = opt.type || 'json';
    } else {
      type = opt || 'json';
      opt = {};
    }
    opt.type = type;
    if (opt && opt.headers) {
      Object.keys(opt.headers).forEach(function (key) {
        res.setHeader(key, opt.headers[key]);
      });
    }
    if (err) {
      return next({
        type: type,
        mime: mimes[type] || 'text/html',
        error: err
      });
    }
    if (processor) {
      data = processor(
        {
          req: req,
          res: res
        },
        data,
        opt
      );
    }
    switch (type) {
      case 'html':
        res.setHeader('content-type', opt.contentType || 'text/html');
        res.render(data.tpl, data.data);
        break;
      case 'xml':
        res.setHeader('content-type', 'application/xml');
        res.end(data);
        break;
      case 'redirect':
        res.redirect(data);
        break;
      case 'csv':
        res.setHeader('content-type', 'text/csv');
        res.setHeader('content-disposition', 'attachment;filename=download.csv');
        res.end(data);
        break;
      case 'stream':
        if (typeof data.headers === 'object') {
          Object.keys(data.headers).forEach((key) => {
            res.setHeader(key, data.headers[key]);
          });
        } else {
          res.setHeader('content-type', 'text/plain');
        }
        res.status(data.statusCode >= 100 && data.statusCode < 600 ? data.statusCode : 500);
        data.pipe(res);
        break;
      case 'download':
        // res.setHeader('content-type', opt.contentType || 'application/octet-stream');
        res.setHeader('content-disposition', 'attachment;filename=' + (opt.downloadName || 'download'));
        res.end(data);
        break;
      case 'raw':
      case 'text':
        res.setHeader('content-type', opt.contentType || 'text/plain');
        res.end(data);
        break;
      case 'jsonp':
        if (wrapJson) {
          data = wrapJson(null, data, req.rid);
        }
        data.debug = opt.debug;
        res.jsonp(data);
        break;
      default:
        if (wrapJson) {
          data = wrapJson(null, data, req.rid);
        }
        data.debug = opt.debug;
        try {
          res.json(data);
        } catch (err) {
          next({
            type: type,
            mime: mimes[type] || 'text/html',
            error: err
          });
        }
    }
  };
};

module.exports.setProcessor = function (proc) {
  processor = proc;
};

module.exports.wrapJson = function (wj) {
  wrapJson = wj;
};
