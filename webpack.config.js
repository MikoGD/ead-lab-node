/* eslint-disable @typescript-eslint/no-var-requires */
const FileManagerPlugin = require('filemanager-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './src/public/scripts/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist/public/scripts'),
    filename: 'index.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: '/node_modules/',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.css'],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './src/public/index.html' }),
    new FileManagerPlugin({
      events: {
        onStart: {
          delete: [path.resolve(__dirname, 'dist/public/index.html')],
        },
        onEnd: {
          move: [
            {
              source: path.resolve(__dirname, 'dist/public/scripts/index.html'),
              destination: path.resolve(__dirname, 'dist/public/index.html'),
            },
          ],
        },
      },
    }),
  ],
};
