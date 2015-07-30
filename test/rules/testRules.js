var rules = require('../../src/rules/rules.js');

module.exports.testEnergyDecay = function(test) {
  var bot = rules.createBot();

  rules._private.energyDecay(bot);

  test.equals(bot.energy, bot.sysvars.nrg, "Expected bot energy to equal bot sysvar nrg");
  test.done();
};
