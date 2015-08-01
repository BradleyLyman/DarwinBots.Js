var path                 = require('path'),
    node_modules         = path.resolve(__dirname, 'node_modules'),
    pathToReact          = path.resolve(node_modules, 'react/dist/react.min.js'),
    pathToMaterializeCss = path.resolve(node_modules, 'materialize-css/bin/materialize.css'),
    pathToMaterializeJs  = path.resolve(node_modules, 'materialize-css/bin/materialize.js'),
    HtmlWebpackPlugin    = require('html-webpack-plugin');

module.exports = {
  entry  : ['webpack/hot/dev-server', path.resolve(__dirname, 'app/main.js')],
  resolve : {
    alias : {
      'react'           : pathToReact,
      'materialize.css' : pathToMaterializeCss,
      'materialize.js'  : pathToMaterializeJs
    }
  },
  output : {
    path     : path.resolve(__dirname, 'build'),
    filename : 'bundle.js',
  },
  module : {
    loaders : [{
        test   : /\.jsx?$/,
        loader : 'babel'
      }, {
        test   : /\.css$/,
        loader : 'style!css'
      }, {
        test   : /\.woff$/,
        loader : 'url?limit=100000'
      }, {
        test   : /\.woff2$/,
        loader : 'url?limit=100000'
      }, {
        test   : /\.ttf$/,
        loader : 'url?limit=10'
      }, {
        test   : /\.svg$/,
        loader : 'url?limit=100000'
      }, {
        test   : /\.eot$/,
        loader : 'url?limit=100000'
      },
    ],
    noParse : [pathToReact]
  },
  plugins : [
    new HtmlWebpackPlugin({
      title    : 'DarwinBots.js',
      template : './app/index.html',
      inject   : 'body'
    })
  ]
};
