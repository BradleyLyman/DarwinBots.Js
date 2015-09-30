/**
 * Contains methods for creating Bot objects.
 * @module Simulation/Bot
 **/

/**
 * @typedef Bot
 * @type {Object}
 * @property {Number} speciesId - Simulation-specific identifier for the
 *                                bot's species.
 * @property {Object} sysvars - The bot's sysvars.*
 * @property {Species} species - The bot's species.
 * @property {Number} nrg - The bot's current energy level, when this reaches
 *                          zero the bot dies.
 **/

/**
 * Creates a new Bot using the species provided. Assumes that the species
 * is valid.
 * @param {Species} species
 * @return {Bot}
 **/
module.exports.createBot = function(species) {
  return {
    species   : species,
    sysvars   : {},
    nrg       : 0,
    speciesId : 0
  };
};

