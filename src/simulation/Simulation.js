/**
 * Methods for creating and running a complete DarwinBots simulation.
 * @module Simulation
 **/

var Bot    = require('./Bot.js'),
    Rules  = require('./Rules.js'),
    Result = require('object-result'),
    Ok     = Result.Ok,
    Err    = Result.Err;

/**
 * @typedef SpeciesConfig
 * @type {Object}
 * @property {Species} species - The species that is being configured.
 * @property {Number} initialPopulation - The initial population of bots of
 *                                        this species.
 **/

/**
 * @typedef SimulationConfig
 * @type {Object}
 * @property {Number} initialNrg - Initial Nrg for each Bot.
 * @property {Number} nrgDecayRate - Minimum nrg cost of living, the bots
 *                                   loose this amount of nrg each cycle.
 * @property {Array.<SpeciesConfig>} speciesConfig - Array describing the
 *                                                   initial populations.
 **/

/**
 * @typedef Simulation
 * @type {Object}
 * @property {SimulationConfig} config - Configuration object describing the
 *                                       various simulation parameters.
 * @property {Array.<Bot>} bots - Array of Bots currently alive in the sim.
 **/

/**
 * Create a new simulation from the configuration.
 * @param {SimulationConfig} config
 * @return {Result} Ok value is a simulation object, Err value is a string
 *                  describing what went wrong.
 **/
module.exports.createSimulation = function(config) {
  // ensure all species are valid
  var err;
  config.speciesConfig.forEach(function(speciesConfig) {
    if (!speciesConfig.species.isValid) {
      err = Err(
        "Cannot create a simulation with " + speciesConfig.species.name +
        " because that species is not valid."
      );
    }
  });

  if (err !== undefined) {
    return err;
  }

  // create all bots in the simulation
  var bots = [];
  config.speciesConfig.forEach(function(speciesConfig, index) {
    var i = 0;
    var bot;

    for (i = 0; i < speciesConfig.initialPopulation; i++) {
      bot           = Bot.createBot(speciesConfig.species);
      bot.nrg       = config.initialNrg;
      bot.speciesId = index;
      bots.push(bot);
    }
  });

  var simulation = {
    config : config,
    bots   : bots
  };

  // sync initial sysvars before the first cycle is executed
  Rules.syncSysvars(simulation);

  return Ok( simulation );
};

/**
 * Steps the simulation through a single cycle.
 * @param {Simulation} The simulation to update.
 **/
module.exports.stepSimulation = function(simulation) {
  // Execute each bot's brain
  simulation.bots.forEach(function(bot) {
    bot.species.dnaCmd(bot.sysvars);
  });

  // Execute simulation rules
  Rules.passiveNrgDecay(simulation);
  Rules.removeDeadBots(simulation);

  // Sync sysvars with bot state once all other rules have
  // finished executing
  Rules.syncSysvars(simulation);
};




