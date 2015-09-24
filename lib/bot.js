'use strict';

// Modules needed
// ----------------------------------------------------------------------------
var irc      = require('irc');
var loggy    = require('loggy');
var _        = require('underscore');
var L10N     = require('./l10n');
var Log      = require('./log');
var Command  = require('./command');
var Formater = require('./formater');
var SManager = require('./stringmanager');

// DEFAULT COMMANDS
// ----------------------------------------------------------------------------
var COMMANDS = {
  help  : {
    type: 'help',
    help: 'Needs some help? Just call me with HELP or HELP <command>'
  },
  start : {
    type: 'begin',
    help: 'Call me with START or START <title> to record the meeting'
  },
  end   : {
    type: 'end',
    help: 'Call me with END or END <format> to stop recording the meeting'
  }
};

// DEFAULT SPEECH
// ----------------------------------------------------------------------------
var SPEECH = {
  begin     : ['Meeting is recorded now.'],
  end       : ['Meeting is over.'],
  format    : ['Minutes has been formated ({{format}}).'],
  help      : ['{{help}}'],
  hi        : ['Hi! I\'m ready to record your meeting'],
  nohelp    : ['Sorry, no help available!'],
  reconnect : ['Sorry, I\'ve been kicked out!'],
  record    : ['Record done.'],
  section   : ['> {{title}}']
};

// EVENT HANDLERS
// ----------------------------------------------------------------------------
// See https://node-irc.readthedocs.org/en/latest/API.html#events for all
// events callback signature
var EVENT = {
  join: function (channel, nick) {
    if (nick !== this.userName) { return; }

    this.onJoin(channel);
  },

  kick: function (channel, nick, by, reason) {
    if (nick !== this.userName) { return; }

    loggy.warn('Kick from', channel, 'by', by, 'because:', reason);
    this.onLeave(channel, 'kick');
  },

  kill: function (nick, reason, channels) {
    if (nick !== this.userName) { return; }

    loggy.warn('Kill from', channels, 'because:', reason);
    channels.forEach(this.onLeave.bind(this));
  },

  message: function (nick, channel, msg) {
    if (nick === this.userName) { return; }

    this.onMessage(channel, nick, msg);
  },

  registered: function () {
    var channel;

    for (channel in this.channels) {
      if (this.channels.hasOwnProperty(channel)) {
        this.irc.join(channel);
      }
    }
  }
};

// The Bot Object
// ----------------------------------------------------------------------------
function Bot(cfg) {
  var registerCommand,
      registerChannel,
      speech = _.extend({}, SPEECH, cfg.speech);

  // Check basic required configuration:
  // A server and a channel to join.
  if (!cfg.server) {
    throw new Error('An IRC server is expected');
  }

  if (!cfg.channels || !cfg.channels.length) {
    throw new Error('A least one channel is expected');
  }

  if (typeof cfg.channels === 'string') {
    cfg.channels = [cfg.channels];
  }

  // Set up speech strings
  this.l10n   = new L10N(cfg.locale);
  this.speech = new SManager(speech, this.l10n.locale);

  // Set up bot
  this.server   = cfg.server;
  this.port     = cfg.port     || 6667;
  this.userName = cfg.userName || 'MeetingBot';
  this.realName = cfg.realName || 'MeetingBot';
  this.dir      = cfg.dir      || './logs';
  this.output   = cfg.output === 'WikiMedia' ? 'wikimedia' :
                  cfg.output === 'MarkDown'  ? 'markdown'  :
                  cfg.output === 'HTML'      ? 'html'      :
                                               'raw'       ;

  // Register channels
  this.channels = {};
  registerChannel = this.registerChannel.bind(this);

  _.each(cfg.channels, registerChannel);

  // Register commands
  this.commands = {};
  registerCommand = this.registerCommand.bind(this);

  _.each(_.extend({}, COMMANDS, cfg.commands), registerCommand);
}

Bot.prototype.connect = function connect() {
  loggy.info('Connecting to', this.server + ':' + this.port,
             'as', this.userName);

  this.irc = new irc.Client(this.server, this.userName, {
    userName: this.userName,
    realName: this.realName,
    port    : this.port
  });

  loggy.info('Waiting registration to connect to channels');

  // Handle errors
  this.irc.on('error', loggy.error.bind(loggy));

  // Handle joining
  this.irc.addListener('join', EVENT.join.bind(this));

  // Handle disconnection
  this.irc.addListener('kill', EVENT.kill.bind(this));
  this.irc.addListener('kick', EVENT.kick.bind(this));

  // Handle message log
  this.irc.addListener('message', EVENT.message.bind(this));

  // Handle connection
  this.irc.addListener('registered', EVENT.registered.bind(this));
};

Bot.prototype.registerCommand = function registerCommand(command, name) {
  if (command.call !== false) {
    command.call = this.userName;
  }

  try {
    this.commands[name.toLowerCase()] = new Command(command, this.l10n.locale);
  } catch (e) {
    loggy.error('Unable to register command:', name);
  }
};

Bot.prototype.registerChannel = function registerChannel(channel) {
  this.channels[channel] = {
    logger   : new Log(channel, 'Meeting ' + this.l10n.getDate()),
    connected: false
  };
};

Bot.prototype.tell = function (channel, id, param) {
  var msg = this.speech.getString(id, param, this.l10n.locale);

  if (msg) {
    this.irc.say(channel, msg);
  }
};

Bot.prototype.onMessage = function (channelName, nick, msg) {
  var hasCommand, channel = this.channels[channelName];

  if (!channel) { return; }

  hasCommand = _.some(this.commands, function (command) {
    return command.exec(this, channel.logger, msg);
  }, this);

  if (!hasCommand) {
    channel.log.push(nick, msg);
  }
};

Bot.prototype.onJoin = function (channelName) {
  var channel = this.channels[channelName];

  if (!channel || channel.connected === true) { return; }

  loggy.info('Join:', channelName);
  channel.connected = true;

  this.tell(channelName, 'hi');
};

Bot.prototype.onLeave = function (channelName, event) {
  var log, channel = this.channels[channelName];

  if (!channel || channel.connected !== true) { return; }

  channel.connected = 'pending';

  if (event === 'kick') {
    loggy.info('Try to rejoin', channel, 'in 5s');
    setTimeout((function () {
      this.irc.join(channel, (function () {
        this.tell(channel, 'reconnect');
      }).bind(this));
    }).bind(this), 5000);
  }

  log.end(new Formater(this.output, this.dir));
};

// Expose Bot module
// ----------------------------------------------------------------------------
module.exports = Bot;
