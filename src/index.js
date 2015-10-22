'use strict';
/**
 * Contains the methods and objects for creating and
 * running a DarwinBots.js simulation.
 * @module DarwinBots
 **/

var Simulation = require('./simulation/Simulation.js'),
    Species    = require('./simulation/Species.js');

/**
 * Simulation module.
 **/
module.exports = Simulation;

/**
 * Simulation/Species module.
 **/
module.exports.Species = Species;

