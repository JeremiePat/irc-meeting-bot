'use strict';

// Modules needed
// ----------------------------------------------------------------------------
var loggy      = require('loggy');
var _          = require('underscore');
var L10NString = require('./l10n.string.js');
var Formater   = require('./formater');

// Basic command type
// ----------------------------------------------------------------------------
var BASIC_COMMAND = {
  help: function help(bot, log, msg) {
    var m   = msg.replace(this.match, '').trim().toLowerCase();
    var i   = m.indexOf(' ');
    var cmd = i > 0 ? m.slice(0, i) : m;
    var out = [];
    var noCommand = !cmd;

    loggy.info('Providing help for', cmd || 'all commands');

    _.some(bot.commands, function (command, name) {
      var isCommand = cmd === name;
      var hasHelp   = !!command.help;

      if (hasHelp && (noCommand || isCommand)) {
        if (noCommand) {
          out.push('> ' + name.toUpperCase());
        }

        else {
          out.push(name.toUpperCase());
          out.push(
            '> ' +
            command.help
              .toString(bot.l10n.locale)
              .replace(/(.{76,}?)\s+/g, '$1\n> ')
          );
        }
      }

      return isCommand;
    });

    if (out.length > 0) {
      if (noCommand) {
        out.sort();
      }

      bot.tell(log.channel, this.speech, {help: out.join('\n')});
    }

    else {
      bot.tell(log.channel, 'nohelp');
    }
  },

  record: function record(bot, log, msg) {
    var str = msg
      .slice(msg.search(this.match))
      .replace(this.match, '');

    log.record(this.label, str);
    bot.tell(log.channel, this.speech);
  },

  section: function section(bot, log, msg) {
    var title = msg.split(this.match)[1] || msg;

    log.section(title);
    bot.tell(log.channel, this.speech, {title: title});
  },

  begin: function begin(bot, log, msg) {
    var newMeeting = msg.split(this.match)[1];

    log.begin(newMeeting);
    bot.tell(log.channel, this.speech, {title: newMeeting});
  },

  end: function end(bot, log, msg) {
    var format     = msg.split(this.match)[1],
        tellEnd    = log.recording,
        output     = new Formater(
          format || bot.output, bot.dir,
          'meeting.' + bot.l10n.getMoment('YYYYMMDD'));

    log.end(output);

    if (tellEnd) { bot.tell(log.channel, this.speech); }

    if (format)  { bot.tell(log.channel, 'format', {format: output.format.name}); }
  }
};

// Command objects
// ----------------------------------------------------------------------------
function Command(cfg, locale) {
  if (!(cfg.type in BASIC_COMMAND)) {
    throw new Error('Unknown command type');
  }

  if (!cfg.match) {
    cfg.match = cfg.name;
  }

  if (typeof cfg.match === 'string') {
    if (cfg.call) {
      cfg.match = '^' + cfg.call + ':?\\s*' + cfg.match.replace(/^\^/, '');
    }

    cfg.match = new RegExp(cfg.match, 'i');
  }

  if (!(cfg.match instanceof RegExp)) {
    throw new Error('Unknown matcher');
  }

  this.match  = cfg.match;
  this.type   = cfg.type;
  this.name   = cfg.name  || this.type;
  this.label  = cfg.label || this.name;
  this.help   = cfg.help ? new L10NString(cfg.help, locale) : null;
  this.speech = cfg.speech || cfg.type;

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
