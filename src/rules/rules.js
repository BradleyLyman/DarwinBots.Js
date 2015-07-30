var Immutable = require('immutable');

var _constants = Immutable.Map({
  energyDecay : 10
});

var _defaultBot = {
  energy : 100,
  alive  : true
};

var _copySysvars = function(vars) {
  var copy = {};

  Object.getOwnPropertyNames(vars || {}).forEach(function(varName) {
    copy[varName] = vars[varName];
  });

  return copy;
};


/**
 * Applies the energy decay rule to the bot's energy value, then updates
 * the bot's nrg sysvar.
 **/
var _energyDecay = function(bot) {
  bot.energy     -= _constants.get("energyDecay");
  bot.sysvars.nrg = bot.energy;
  bot.alive       = bot.energy > 0;
};

module.exports._private = {
  energyDecay : _energyDecay
};

/**
 * Public API
 **/

/**
 * Creates a new bot for the simulation.
 * Options is a list of parameters that should be pre-initialized
 * when the bot is created, otherwise default values are used.
 * Option Parameters:
 *   sysvars -- bot's sysvars, defaults to an empty object
 *   energy  -- energy defaults to 100
 **/
module.exports.createBot = function(options) {
  var botSettings = options || {},
      bot         = {};

  bot.sysvars = _copySysvars(botSettings.sysvars);

  Object.getOwnPropertyNames(_defaultBot).forEach(function(prop) {
    bot[prop] = botSettings[prop] || _defaultBot[prop];
  });

  return bot;
};











