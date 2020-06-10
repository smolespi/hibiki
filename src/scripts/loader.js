/**
 * @fileoverview Module loader
 * @description Loads, unloads, and reloads modules
 */

const { readdirSync, statSync } = require("fs");
const path = require("path");

const command_directory = path.join(__dirname, "../commands");
const event_directory = path.join(__dirname, "../events");
const extension_directory = path.join(__dirname, "../extensions");

// Command loader
module.exports.commands = async function loadCommands(bot) {
  const files = readdirSync(command_directory);
  files.forEach(subfolder => {
    const stats = statSync(`${command_directory}/${subfolder}`);
    if (!stats.isDirectory) return;
    const cmds = readdirSync(`${command_directory}/${subfolder}`);

    // Loads commands
    cmds.forEach(cmd => {
      let command;
      try {
        command = require(`${command_directory}/${subfolder}/${cmd}`);
      } catch (err) {
        bot.log(`${command} failed to load: ${err}`);
      }

      // Adds commands
      if (!command) return;
      const _command = new command(bot, command.name, /(.{1,})\.js/.exec(cmd)[1]);
      if (!_command.keys.every(k => Object.keys(bot.key).includes(k) && bot.key[k])) return;
      bot.commands.push(_command);
    });
  });

  bot.log.info(`${bot.commands.length} commands loaded`);
};

// Event loader
module.exports.events = async function loadEvents(bot) {
  const files = readdirSync(event_directory);
  files.forEach(evnt => {
    let event;
    try {
      event = require(`${event_directory}/${evnt}`);
    } catch (err) {
      bot.log(`${event} failed to load: ${err}`);
    }

    // Adds events; runs them
    bot.events.push(new event(bot, /(.{1,})\.js/.exec(evnt)[1]));
    event = bot.events.find(e => e.id === evnt.split(".js")[0]);
    bot.on(event.name, (arg1, arg2) => {
      event.run(arg1, arg2);
    });
  });

  bot.log.info(`${bot.events.length} events loaded`);
};

// Extension loader
module.exports.extensions = async function loadExtensions(bot) {
  const files = readdirSync(extension_directory);
  files.forEach(ext => {
    let extension;
    if (ext.isDirectory) return;
    if (!ext.endsWith(".ext.js")) return;
    try {
      extension = require(`${extension_directory}/${ext}`);
    } catch (err) {
      bot.log(`${extension} failed to load: ${err}`);
    }

    if (!extension) return;
    if (typeof extension === "function") bot.extensions.push(extension);
  });

  // Loads extensions; runs
  if (process.uptime() < 20) {
    bot.extensions.forEach(e => e(this));
    bot.log.info(`${bot.extensions.length} extensions loaded`);
  }
};

// Loads all modules
module.exports.all = async function loadAll(bot) {
  this.commands(bot);
  this.events(bot);
  this.extensions(bot);
};
