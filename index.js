// The irc-meeting-bot is an IRC bot made to record IRC meeting and process
// them in order to provide easy to use minutes
// ============================================================================
'use strict';

// Modules needed
// ----------------------------------------------------------------------------
var path     = require('path');
var cli      = require('cli');
var jsonfile = require('jsonfile');
var loggy    = require('loggy');
var Bot      = require('./lib/bot');

// Launch bot
// ----------------------------------------------------------------------------
cli.enable('version');
cli.setApp('irc-meeting-bot', '1.0.0');

cli.parse({
  config   : ['f', 'Define the bot configuration file',             'file'  ],
  server   : ['s', 'Define the server to connect',                  'domain'],
  port     : ['p', 'Define on which port to connect',               'number'],
  output   : ['o', 'Define the output format for the minutes',      'string'],
  userName : ['u', 'Define the user name to display in channels',   'string'],
  realName : ['r', 'Define the real name to provide to the server', 'string'],
  channels : ['c', 'Define the channel to join',                    'string'],
  dir      : ['d', 'Define where to store the generated minutes',   'path'  ]
});

cli.main(function (args, options) {
  var cfg, bot;

  if (options.config) {
    try {
      cfg = jsonfile.readFileSync(options.config);
    } catch (e) {}
  }

  cfg = cfg || {};

  // Command line arguments override configuration files
  cfg.server   = options.server            || cfg.server;
  cfg.port     = options.port              || cfg.port;
  cfg.output   = options.output            || cfg.output;
  cfg.userName = options.userName          || cfg.userName;
  cfg.realName = options.realName          || cfg.realName;
  cfg.channels = options.channels          || cfg.channels;
  cfg.dir      = (typeof options.dir === 'string' &&
                  path.resolve(options.dir)) || cfg.dir;

  try {
    bot = new Bot(cfg);
    bot.connect();
  } catch (e) {
    loggy.error(e);
  }
});
