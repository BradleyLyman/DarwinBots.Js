/**
 * Methods and objects for managing a DarwinBots.js simulation.
 * @module Simulation
 **/

var parser = require('../parser/index.js');

/**
 * @typedef Species
 * @type {Object}
 * @property {String} rawSource - The species' raw dna source code.
 * @property {String} name - The species' name.
 * @property {Bool} isValid - True if the dna compiles successfully.
 * @property {DnaCallback} dnaCmd - Function for executing the species'
 *                                  dna, this is undefined if isValid == false.
 * @property {String} compileErr - String describing the compilation error,
 *                                 this is undefined if isValid == true.
 **/

/**
 * @callback DnaCallback
 * @param {Object} sysvars - Bot's sysvars object.
 **/

/**
 * Creates a new Species object.
 * @param {String} rawSource - The species' raw dna source code.
 * @param {String} name - The species' name.
 * @return {Species}
 **/
module.exports.createSpecies = function(rawSource, name) {
  var compileResult = parser.compileSource(rawSource);

  return {
    rawSource  : rawSource,
    name       : name,
    isValid    : compileResult.is_err(),
    dnaCmd     : compileResult.get_ok(),
    compileErr : compileResult.get_err()
  };
};





