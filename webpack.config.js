var pkg = require('./package.json');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  devtool: false,
  entry: {
    sversion : './src/sversion.js'
  },
  output: {
    path: './dist',
    filename: '[name].min.js',
    library: 'SVersion',
    libraryTarget: 'umd',
    umdNameDefine: true
  },
  module: {
    loaders: [
      {
        test: /\.html$/, loader: 'html?minimize=false'
      },
      {
        test: /\.js$/, loader: 'babel'
      },
      {
        test: /\.less$/,
        loader: 'style!css!less'
        // loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader') // 将css独立打包
      },
      {
        test: /\.json$/, loader: 'json'
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin([
        'sVersion v' + pkg.version + ' (' + pkg.homepage + ')'
    ].join('\n')),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
    // ,new ExtractTextPlugin('[name].min.css') // 将css独立打包
  ]
};
