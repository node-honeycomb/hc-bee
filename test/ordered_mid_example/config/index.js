module.exports = {
  middleware: {
    cookieSession: {
      config: {
        secret: 'xx'
      }
    }
  },
  orderedMiddleware: [
    'cookieSession', 'bodyParser'
  ]
};
