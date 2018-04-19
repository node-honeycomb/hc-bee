'use strict';

module.exports = (opt) => {
  function Mid5(req, res, next) {
    res.write(opt.overwrite || 'mid5Default');
    next();
  };

  Mid5.match = function (req) {
    return req.url.indexOf('switchMid=mid5') !== -1;
  };

  return Mid5;
};
