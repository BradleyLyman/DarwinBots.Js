'use strict';
var React = require('react');

require('./component.css');

module.exports = React.createClass({
  render : function() {
    return (
      <div className="row">
        <div className="col s12">
          <div className="card-panel grey">
            <h1>Hello World</h1>
            <label htmlFor="picker" className="my-custom-file-upload waves-effect waves-light btn blue darken-2">
              Choose File
              <input type="file" id="picker"></input>
            </label>
          </div>
        </div>
      </div>
    );
  }
});
