const path = require('path');
const assert = require('assert');
const {exec} = require('child_process');

describe('order-mids.test.js', () => {
  it('should warning ordered mids', (done) => {
    const dir = path.join(__dirname, 'ordered_mid_example');

    exec(
      `node ${path.join(dir, 'app.js')}`,
      {
        cwd: dir,
        env: {
          HC_APP_CONFIG: JSON.stringify({
            serverRoot: './',
            appRoot: path.join(__dirname, './ordered_mid_example')
          })
        }
      }
      ,
      (err, stdout, stderr) => {
        if(err) {
          return done(err);
        }

        assert(stdout.includes('carefully'))
        done();
      }
    )
  });
});
