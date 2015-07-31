var path         = require('path'),
    node_modules = path.resolve(__dirname, 'node_modules'),
    pathToReact  = path.resolve(node_modules, 'react/dist/react.min.js');

module.exports = {
  entry  : ['webpack/hot/dev-server', path.resolve(__dirname, 'app/main.js')],
  resolve : {
    alias : {
      'react' : pathToReact
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
    }],
    noParse : [pathToReact]
  },
};
