// meeting.js is an IRC bot made to record IRC meeting and process them in
// order to provide easy to use minutes
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
cli.setApp('irc-meeting-bot','1.0.0');

cli.parse({
  config   : ['f', 'Define the bot configuration file', 'file'],
  server   : ['s', 'Define the server to connect', 'domain'],
  port     : ['p', 'Define on which port to connect', 'number'],
  output   : ['o', 'Define the output format for the minutes', 'string'],
  userName : ['u', 'Define the user name to display in channels', 'string'],
  realName : ['r', 'Define the real name to provide to the server', 'string'],
  channels : ['c', 'Define the channel to join', 'string'],
  dir      : ['d', 'Define where to store the generated minutes', 'path']
});

cli.main(function (args, options) {
  var cfg;

  if (options.config) {
    try {
      cfg = jsonfile.readFileSync(options.config);
    } catch (e) {}
  }

  cfg = cfg || {};

  // Command line arguments override configuration files
  if (options.server)   { cfg.server   = options.server;            }
  if (options.port)     { cfg.port     = options.port;              }
  if (options.output)   { cfg.output   = options.output;            }
  if (options.userName) { cfg.userName = options.userName;          }
  if (options.realName) { cfg.realName = options.realName;          }
  if (options.channels) { cfg.channels = options.channels;          }
  if (options.dir)      { cfg.dir      = path.resolve(options.dir); }

  try {
    var bot = new Bot(cfg);
    bot.connect();
  } catch (e) {
    loggy.error(e);
  }
});
