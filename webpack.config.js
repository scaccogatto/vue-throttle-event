const webpack = require('webpack');
const path    = require('path');

const config = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'vue-throttle-event.js',
    library: 'VueThrottleEvent',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, './src'),
        exclude: /node_modules/,
        use: "babel-loader"
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ]
}

module.exports = config;
