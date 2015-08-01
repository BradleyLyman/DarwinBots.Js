'use strict';
var React = require('react'),
    Hello = require('./component.jsx');

require('materialize.css');
require('materialize.js');
React.render(<Hello />, document.getElementById('app'));
