'use strict';

module.exports = (opt) => {
  function Mid4(req, res, next) {
    res.write(opt.overwrite || 'mid4Default');
    next();
  };

  Mid4.match = function (req) {
    return req.url.indexOf('switchMid=mid4') !== -1;
  };

  return Mid4;
};
