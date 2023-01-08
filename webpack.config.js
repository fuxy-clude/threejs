const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  node: {
    __dirname: false,
  },
  entry: require('path').resolve(__dirname, 'src', 'index.tsx'),
  devServer: {
    hot: true,
    watchContentBase: false,
    liveReload: false,
    port: 3000,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    historyApiFallback: true,
  },
  module: {
    rules: [{
      test: /\.(js|jsx|ts|tsx)$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    },
      {
      enforce: 'post',
      test: /\.(js|jsx|ts|tsx)$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      options: {
        // This is a feature of `babel-loader` for webpack (not Babel itself).
        // It enables caching results in ./node_modules/.cache/babel-loader/
        // directory for faster rebuilds.
        cacheDirectory: true,
      },
    }, {
      test: /\.scss$/,
      use: [
        'style-loader', {
          loader: 'css-loader',
          options: {
            modules: {
              localIdentName: '[local]--[hash:base64:5]',
            },
          },
        }, 'sass-loader'],
    }, {
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader',
      ],
    }, {
      test: /\.(png|svg|jpg|jpeg|gif|mp3|glb|hdr|fbx|ogg)$/,
      use: ['file-loader'],
    }, {
      test: /\.(woff|woff2|eot|ttf|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      use: [
        'file-loader',
      ],
    }, {
        test: /\.glsl$/,
        use: ['raw-loader']
    }],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': `${__dirname}/src`,
      'src': `${__dirname}/src`,
    },
  },
  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: require('path').resolve(__dirname, 'index.html'),
      filename: './index.html',
    }),
  ],
  output: {
    library: `fxy`,
    libraryTarget: 'umd',
    chunkFilename: '[name].[contenthash].bundle.js',
    jsonpFunction: `webpackJsonp_fxy`,
    globalObject: 'window',
  },
};
