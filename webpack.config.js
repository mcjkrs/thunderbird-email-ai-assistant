const path = require('path');

module.exports = {
  entry: {
    background: './background.js',
    options: './options.js',
  },
  output: {
    filename: '[name]-bundle.js', // [name] will be replaced by 'background' or 'options'
    path: path.resolve(__dirname),
  },
  mode: 'development',
  devtool: 'inline-source-map',
};
