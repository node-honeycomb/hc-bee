'use strict';

module.exports = {
  logs: {
    sys: {
      file: '${serverRoot}/logs/${appName}/sys.%year%-%month%-%day%.log'
    }
  },
  middleware: {
    csrf: {
      config: {
        secret: "0123456789-0123456789-0123456789"
      }
    }
  }
};
