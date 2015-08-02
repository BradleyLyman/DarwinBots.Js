'use strict';
var React = require('react');

require('./dnaLoader.css');

module.exports = React.createClass({
  getInitialState : function() {
  },

  _onFileChange : function(e) {
    console.log("changed");
    console.log(e.nativeEvent.srcElement.files[0].name);
  },

  render : function() {
    return (
      <div className="row">
        <div className="col s12">
          <div className="card-panel">
            <h4>Dna Loader</h4>
            <label htmlFor="picker" className="my-custom-file-upload waves-effect waves-light btn blue black-text">
              Choose File
              <input type="file" id="picker" onChange={this._onFileChange}></input>
            </label>
          </div>
        </div>
      </div>
    );
  }
});

