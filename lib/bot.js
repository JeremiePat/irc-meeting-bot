'use strict';

// Modules needed
// ----------------------------------------------------------------------------
var irc      = require('irc');
var loggy    = require('loggy');
var L10N     = require('./l10n');
var Log      = require('./log');
var Command  = require('./command');
var Formater = require('./formater');

// The Bot Object
// ----------------------------------------------------------------------------
function Bot(cfg) {
  var l10n;

  if (!cfg.server) {
    throw new Error('An IRC server is expected');
  }

  if (!cfg.channels || !cfg.channels.length) {
    throw new Error('A least one channel is expected');
  }

  if (typeof cfg.channels === 'string') {
    cfg.channels = [cfg.channels];
  }

  l10n = new L10N(cfg.l10n);

  this.server   = cfg.server;
  this.port     = cfg.port     || 6667;
  this.userName = cfg.userName || 'MeetingBot';
  this.realName = cfg.realName || 'MeetingBot';
  this.dir      = cfg.dir      || './logs';
  this.output   = cfg.output === 'WikiMedia' ? 'wikimedia' :
                  cfg.output === 'MarkDown'  ? 'markdown'  :
                  cfg.output === 'HTML'      ? 'html'      :
                                               'raw'       ;
  this.channels = {};

  cfg.channels.forEach((function (channel) {
    this.channels[channel] = new Log(channel, l10n);
  }).bind(this));

  // Default commands
  this.commands = [
    new Command({
      type: 'help',
      name: 'help',
      call: this.userName,
      help: 'Needs some help? Just call me with HELP or HELP <command>'
    }),
    new Command({
      type: 'begin',
      name: 'start',
      call: this.userName,
      help: 'Call me with START or START <title> to record the meeting'
    }),
    new Command({
      type: 'end',
      name: 'end',
      call: this.userName,
      help: 'Call me with END or END <format> to stop recording the meeting'
    })
  ];

  if (Array.isArray(cfg.commands)) {
    cfg.commands.forEach((function (command) {
      if (command.call !== false) {
        command.call = this.userName;
      }

      this.commands.push(new Command(command));
    }).bind(this));
  }
}

Bot.prototype.connect = function connect() {
  var channel, callback;

  loggy.info('Connecting to', this.server + ':' + this.port,
             'as', this.userName);

  this.irc = new irc.Client(this.server, this.userName, {
    userName: this.userName,
    realName: this.realName,
    port    : this.port
  });

  loggy.info('Waiting registration to connect to channels');

  for (channel in this.channels) {
    if (this.channels.hasOwnProperty(channel)) {
      callback = this.buildEventCallback.bind(this, channel);

      // Handle errors
      this.irc.on('error', loggy.error.bind(loggy));

      // Handle joining
      this.irc.addListener('join' + channel, this.onJoin.bind(this, channel));

      // Handle disconnection
      this.irc.addListener('quit',           callback('quit'));
      this.irc.addListener('kill',           callback('kill'));
      this.irc.addListener('part' + channel, callback('part'));
      this.irc.addListener('kick' + channel, callback('kick'));

      // Handle message log
      this.irc.addListener('message' + channel, callback('message'));

      // Handle connection
      this.irc.addListener('registered', callback('registered'));
    }
  }
};

Bot.prototype.buildEventCallback = function (channel, event) {
  var eventCallback = {
    quit: function (nick, reason, channels) {
      channels.forEach((function (chan) {
        if (chan === channel) {
          this.onLeave(channel, event === 'kill');
        }
      }).bind(this));
    },

    part: function () {
      this.onLeave(channel, event === 'kick');
    },

    message: function (nick, msg) {
      this.onMessage(channel, nick, msg);
    },

    registered: function () {
      this.irc.join(channel);
    }
  };

  eventCallback.kill = eventCallback.quit;
  eventCallback.kick = eventCallback.part;

  return eventCallback[event].bind(this);
};

Bot.prototype.speach = function (channel, msg) {
  if (msg) {
    this.irc.say(channel, msg);
  }
};

Bot.prototype.onMessage = function (channel, nick, msg) {
  var log, hasCommand;

  if (nick === this.userName) { return; }

  log = this.channels[channel];

  hasCommand = this.commands.some((function (command) {
    return command.exec(this, log, msg);
  }).bind(this));

  if (!hasCommand) {
    log.push(nick, msg);
  }
};

Bot.prototype.onJoin = function (channel) {
  var log, hi;

  loggy.info('Join:', channel);

  log = this.channels[channel];
  hi  = log && log.l10n && log.l10n._ && log.l10n._('hi');

  this.speach(channel, hi);
};

Bot.prototype.onLeave = function (channel, reconnect) {
  var log = this.channels[channel];

  loggy.warn('Leaving:', channel);

  if (reconnect) {
    loggy.info('Try to rejoin', channel, 'in 5s');
    setTimeout((function () {
      this.irc.join(channel, (function () {
        this.speach(channel, log.l10n._('end'));
      }).bind(this));
    }).bind(this), 5000);
  }

  log.end(new Formater(this.output, this.dir));
};

// Expose Formater module
// ----------------------------------------------------------------------------
module.exports = Bot;
