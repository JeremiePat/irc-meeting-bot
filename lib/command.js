'use strict';

// Modules needed
// ----------------------------------------------------------------------------
var loggy    = require('loggy');
var Formater = require('./formater');

// Basic command type
// ----------------------------------------------------------------------------
var BASIC_COMMAND = {
  help: function help(bot, log, msg) {
    var m   = msg.replace(this.match, '').trim();
    var i   = m.indexOf(' ');
    var cmd = i > 0 ? m.slice(0, m.indexOf(' ')) : m;
    var out = [];

    loggy.info('Providing help for', cmd || 'all commands');

    bot.commands.some(function (command) {
      var noCommand = !cmd;
      var isCommand = cmd === command.name;
      var hasHelp   = !!command.help;

      if (hasHelp && (noCommand || isCommand)) {
        out.push(command.name.toUpperCase());
        out.push('> ' + command.help.replace(/(.{1,76})\s*/g,'$1\n> '));
      }

      return isCommand;
    });

    if (out.length > 0) {
      out.forEach(function (msg) {
        bot.speach(log.channel, msg);
      });
    }

    else {
      bot.speach(log.channel, log.l10n._('nohelp'));
    }
  },

  record: function record(bot, log, msg) {
    log.record(this.label, msg);
    bot.speach(log.channel, log.l10n._('record'));
  },

  section: function section(bot, log, msg) {
    var title = msg.split(this.match)[1] || msg;

    log.section(title);
    bot.speach(log.channel, '> ' + title);
  },

  begin: function begin(bot, log, msg) {
    var newMeeting = msg.split(this.match)[1];

    log.begin(newMeeting);
    bot.speach(log.channel, log.l10n._('begin'));
  },

  end: function end(bot, log, msg) {
    var format     = msg.split(this.match)[1],
        tellEnd    = log.recording,
        output     = new Formater(format || bot.output, bot.dir);

    log.end(output);

    if (tellEnd) { bot.speach(log.channel, log.l10n._('end'));    }
    if (format)  { bot.speach(log.channel, log.l10n._('format')); }
  }
};

// Command objects
// ----------------------------------------------------------------------------
function Command(cfg) {
  if (!(cfg.type in BASIC_COMMAND)) {
    throw new Error('Unknown command type');
  }

  if (!cfg.match) {
    cfg.match = cfg.name;
  }

  if (typeof cfg.match === 'string') {
    if(cfg.call) {
      cfg.match = '^' + cfg.call + ':?\\s*' + cfg.match.replace(/^\^/, '');
    }

    cfg.match = new RegExp(cfg.match, 'i');
  }

  if (!(cfg.match instanceof RegExp)) {
    throw new Error('Unknown matcher');
  }

  this.match = cfg.match;
  this.type  = cfg.type;
  this.name  = cfg.name  || this.type;
  this.label = cfg.label || this.name;
  this.help  = cfg.help;

  loggy.info('Register command', this.name, 'matching', cfg.match.toString());
}

Command.prototype.exec = function exec(bot, log, msg) {
  if (this.match.test(msg)) {
    BASIC_COMMAND[this.type].apply(this, arguments);
    return true;
  }

  return false;
};

// Expose Command module
// ----------------------------------------------------------------------------
module.exports = Command;
