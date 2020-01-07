const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const webpack = require('webpack');

const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: './src/index.js',
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      favicon: 'src/images/favicon.png',
    }),
    new MiniCssExtractPlugin({
      filename: devMode ? '[name].css' : '[name].[hash].css',
      chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
    }),
    // new webpack.ProvidePlugin({
    //   $: 'mdbootstrap/js/jquery-3.4.1.min',
    //   jQuery: 'mdbootstrap/js/jquery-3.4.1.min',
    //   jquery: 'mdbootstrap/js/jquery-3.4.1.min',
    //   'window.$': 'mdbootstrap/js/jquery-3.4.1.min',
    //   'window.jQuery': 'mdbootstrap/js/jquery-3.4.1.min',
    //   // Waves: 'mdbootstrap/js/modules/waves',
    // }),
  ],
  output: {
    filename: 'main.js',
    // chunkFilename: 'vendors/[name].bundle.js',
    path: path.resolve(__dirname, '../dist'),
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: process.env.NODE_ENV === 'development',
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[contenthash].[ext]',
          outputPath: 'assets/images',
        },
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        loader: 'file-loader',
        options: {
          outputPath: 'assets/fonts',
        },
      },
      {
        test: /\.wav$/,
        loader: 'file-loader',
        options: {
          outputPath: 'assets/audio',
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            // presets: [['@babel/preset-env', { useBuiltIns: 'usage', corejs: '3.3.2' }]],
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: { minimize: true },
          },
        ],
      },
    ],
  },
};
