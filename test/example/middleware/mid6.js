'use strict';

module.exports = (opt) => {
  function Mid6(req, res, next) {
    res.write(opt.overwrite || 'mid6Default');
    next();
  };

  Mid6.match = function (req) {
    return req.url.indexOf('switchMid=mid6') !== -1;
  };

  return Mid6;
};
