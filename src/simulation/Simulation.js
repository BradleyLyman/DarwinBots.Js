'use strict';
/**
 * Methods for creating and running a complete DarwinBots simulation.
 * @module Simulation
 **/

var Bot    = require('./Bot.js'),
    Rules  = require('./Rules.js'),
    Result = require('object-result'),
    ok     = Result.createOk,
    err    = Result.createErr;

/**
 * @typedef SpeciesConfig
 * @type {Object}
 * @property {Species} species
 *   The species that is being configured.
 * @property {Number} initialPopulation
 *   The initial population of bots of this species.
 **/

/**
 * @typedef SimulationConfig
 * @type {Object}
 * @property {Number} initialNrg
 *   Initial Nrg for each Bot.
 * @property {Number} nrgDecayRate
 *   Minimum nrg cost per cycle to stay alive.
 * @property {Array<SpeciesConfig>} speciesConfig
 *   Array of species config objects, note that this means
 *   multiple independent populations of the same species
 *   can exist within one simulation.
 **/

/**
 * @typedef Simulation
 * @type {Object}
 * @property {SimulationConfig} config
 *   Configuration object describing the various
 *   simulation parameters.
 * @property {Array.<Bot>} bots
 *   Array of Bots currently alive in the sim.
 **/

/**
 * Create a new simulation from the configuration.
 * @param {SimulationConfig} config
 * @return {Result}
 *  Ok value is a simulation object, Err value is a string
 *  describing what went wrong.
 **/
module.exports.createSimulation = function(config) {
  let speciesConfigArray = config.speciesConfig;

  // verify all species entries are valid
  let error = ok('');
  speciesConfigArray.forEach(speciesConfig => {
    if (!speciesConfig.species.isValid) {
      error = err(
        'Cannot use ' + speciesConfig.species.name +
        'because it did not compile correctly'
      );
    }
  });
  if (error.is_err()) {
    return error;
  }

  // create all bots in the simulation
  let bots = [];
  speciesConfigArray.forEach((speciesConfig, index) => {
    let species    = speciesConfig.species;
    let population = speciesConfig.initialPopulation;
    for (let i = 0; i < population; i++) {
      let bot       = Bot.createBot(species);
      bot.nrg       = config.initialNrg;
      bot.speciesId = index;
      bots.push(bot);
    }
  });

  // create simulation object
  let simulation = {
    config : config,
    bots   : bots,
  };

  // sync sysvars -- the simulation is now ready to run
  Rules.syncSysvars(simulation);
  console.log('aoeuaoeuaoeuoauoaeu');
  console.log(simulation.config);
  // return ok
  return ok(simulation);
};

/**
 * Steps the simulation through a single cycle.
 * @param {Simulation} The simulation to update.
 **/
module.exports.stepSimulation = function(simulation) {
  // Execute each bot's brain
  simulation.bots.forEach(function(bot) {
    bot.species.dna.execute(bot.sysvars);
  });

  // Execute simulation rules
  Rules.passiveNrgDecay(simulation);
  Rules.removeDeadBots(simulation);

  // Sync sysvars with bot state once all other rules have
  // finished executing
  Rules.syncSysvars(simulation);
};
