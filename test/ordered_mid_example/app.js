const Honeybee = require('../../');
const app = new Honeybee();

app.ready(true);

const options = {port: 8000};
app.run((err) => {
  if(err) {
    console.error('start failed');
    process.exit(1);
  }

  console.log('start success');
  return process.exit(0);
}, options);

module.exports = app;
