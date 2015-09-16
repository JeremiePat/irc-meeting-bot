// meeting.js is an IRC bot made to record IRC meeting and process them in
// order to provide easy to use minutes
// ============================================================================
// Usage
// ```bash
// $ node meeting.js -c config.json
// ```
//
// The JSON file is used to configure all the required info to record a meeting
// Here's the configuration option available (options with * are mandatory)
//
// `server`  :*: <string> : The IRC server to connect to.
// `port`    : : <number> : The port of the IRC server (default: 6667)
// `userName`: : <string> : The user name to use (default: 'MeetingBot')
// `realName`: : <string> : The user real name (default: 'MeetingBot')
// `channels`:*: <array>  : A list of channel the bot must connect to
// `commands`: : <array>  : A list of command usable during the meeting
//                          (Default: start, end and help are defined)
// `output`  : : <string> : Define the output format: 'WikiMedia', 'MarkDown',
//                          'HTML', or 'raw' (default: 'raw')
// `l10n`    : : <object> : Define all the localization options for the bot
//
//
// A command is an object with the following parameters:
//
// `name` :*: <string> : Then human readable name of the command
// `label`: : <string> : The label of the corresponding record section within
//                       the generating minutes (default: the command's name)
// `help` : : <string> : The help text for the command
// `match`: : <string> : The string (which will be turn into a case insensitive
//                       RegExp) that must match in a message to call the
//                       command (Default: Any message starting with the
//                       command's name)
// `type` :*: <string> : It can be 'record' (put the msg in a list at the end
//                       of the log), 'section' (start a new section in the
//                       minutes), 'begin' (beginning recording the meeting),
//                       'end' (end recording the meeting), 'help' (provide
//                       help on how to use the bot)
// `call` : : <bool>   : Indicate if the call must be prefix with the name of
//                       the bot and a colon (default: true)
//
//
// An l10n object is an object with the following parameters:
//
// `locale` : : <string> : The locale code in use (default: en)
// `time`   : : <string> : The format for the time record with each IRC message
//                         following the Moment syntax (default: 'HH:mm')
// `nohelp` : : <array>  : An array of string to display when no help is
//                         available (default: 'Sorry, no help available!'). If
//                         more than one string is provide, the displayed
//                         string is picked at random (all parameters accepting
//                         an array work the same). A falsy value indicate that
//                         the bot will remain silent.
// `record' : : <array>  : Display when the bot acknowledge a record
//                         (Default: 'Record done.')
// `begin`  : : <array>  : Display when the bot start recording a meeting
//                         (Default: 'Meeting is recorded now')
// `end`    : : <array>  : Display when the bot stop recording a meeting
//                         (Defaut: 'Meeting is over.')
// `format` : : <array>  : Display when the bot has output the minutes
//                         (Default: 'Minutes has been formated.')
// `hi`     : : <array>  : Display when the bot join a channel
//                         (Default: 'Hi! I'm ready to record your meeting')
'use strict';

// Modules needed
// ----------------------------------------------------------------------------
var cli      = require('cli');
var jsonfile = require('jsonfile');
var loggy    = require('loggy');
var Bot      = require('./lib/bot');

// Launch bot
// ----------------------------------------------------------------------------

cli.enable('version');
cli.setApp('irc-meetingbot','0.0.1');

cli.parse({
  config: ['c', 'Define the bot configuration file', 'file']
});

cli.main(function (args, options) {
  jsonfile.readFile(options.config, function (err, cfg) {
    if (err) {
      loggy.error('Unable to read config:', err);
      return;
    }

    try {
      var bot = new Bot(cfg);
      bot.connect();
    } catch (e) {
      loggy.error(e);
    }
  });
});
