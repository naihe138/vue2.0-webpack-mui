/**
 * @file 公共包打包配置
 * @author renjian
 * @date 2016/8/4
 */
var path = require('path');
var config = require('../config');
var utils = require('./utils');
var webpack = require('webpack');
var env = config.build.env;
var projectRoot = path.resolve(__dirname, '../');
module.exports = {
  entry: {
    public: [
      './src/public/common.js',
      './src/public/config.js',
      './src/public/nativeApi.js',
      './src/public/components/test.vue',
      'vue',
      'vue-resource',
      'vue-router'
    ]
  },
  output: {
    path: config.build.assetsRoot,
    publicPath: '../',
    filename: '[name]/js/[name].js',
    library: '[name]'
  },
  resolve: {
    extensions: ['', '.js', '.vue'],
    fallback: [path.join(__dirname, '../node_modules')],
    alias: {
      'src': path.resolve(__dirname, '../src'),
      'public': path.resolve(__dirname, '../src/public'),
      'components': path.resolve(__dirname, '../src/public/components'),
      'mui': path.resolve(__dirname, '../src/public/mui'),
      'nativeApi': path.resolve(__dirname, '../src/public/nativeApi')
    }
  },
  resolveLoader: {
    fallback: [path.join(__dirname, '../node_modules')]
  },
  module: {
    preLoaders: [
      {
        test: /\.vue$/,
        loader: 'eslint',
        // include: projectRoot,
        exclude: /node_modules/
      }
    ],
    loaders: [
      {
        test: /vux.src.*?js$/,
        loader: 'babel',
        exclude: [/node_modules/, /mui/]
      },
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: [/node_modules/, /mui/]
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.html$/,
        loader: 'vue-html'
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 1,
          name: utils.assetsPath('img/[name].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 1,
          name: utils.assetsPath('fonts/[name].[ext]')
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': env
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: false
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DllPlugin({
      path: path.resolve(config.build.assetsRoot, '[name]/manifest.json'),
      name: '[name]',
      context: projectRoot
    })
  ],
  eslint: {
    formatter: require('eslint-friendly-formatter')
  },
  vue: {
    loaders: utils.cssLoaders()
  }
};
