const path = require('path');

module.exports = {
    entry: './lib/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'form-validate.min.js',
    },
    externals : {
        '.' : {
        //   commonjs: 'lodash',
        //   amd: 'lodash',
          root: 'FormValidate' // indicates global variable
        }
      },
};
