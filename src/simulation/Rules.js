/**
 * Rules for dictating how the simulation advances each cycle.
 * @module Simulation/Rules
 **/

/**
 * Passively decays the nrg for each bot in the simulation.
 * @param {Simulation}
 **/
module.exports.passiveNrgDecay = function(simulation) {
  simulation.bots.forEach(function(bot) {
    bot.nrg -= simulation.config.nrgDecayRate;
  });
};

/**
 * Removes bots with nrg <= 0.
 * @param {Simulation}
 **/
module.exports.removeDeadBots = function(simulation) {
  simulation.bots = simulation.bots.filter(function(bot) {
    return bot.nrg > 0;
  });
};

/**
 * Syncs the bot's sysvars with the simulation values.
 * @param {Simulation}
 **/
module.exports.syncSysvars = function(simulation) {
  simulation.bots.forEach(function(bot) {
    bot.sysvars.nrg = bot.nrg;
    bot.sysvars.id  = bot.speciesId;
  });
};
