irc-meeting-bot
-------------------------------------------------------------------------------

A simple IRC bot to record meeting minutes

## Usage

```bash
$ mkdir irc-bot
$ cd irc-bot
$ git clone https://github.com/JeremiePat/irc-meeting-bot.git .
$ npm install
$ node index.js -f config.json
```

### Command line options

```
-h --help     Help about command line options
-s --server   Indicate the IRC server to connect with
-p --port     Indicate the port to use
-o --output   Indicate the output format to use (one of those available in ./lib/format)
-u --username The user name to use to connect
-r --realname The real name to use to connect
-a --channels A channel to join
-d --dir      Indicate in which directory generated minutes must be stored (Default: './logs')
-f --config   The location of the configuration file to use
```

If used, those command line options always override those set in a configuration file.

## Configuration

To fine tune your bot, the best way to do it is to set a configuration file. An
example is available in the [conf](./conf) directory. Such configuration is a
json object with the following properties:

| Property   | Value          | Notes
| ---------- | -------------- | --------------
| `server`  *| <string>       | (Mandatory) The IRC server to connect to.
| `channels` | <array> or <string> | (Mandatory) A channel or list of channels the bot must join
| `port`     | <number>       | The port of the IRC server (default: 6667)
| `userName` | <string>       | The user name to use (default: 'MeetingBot')
| `realName` | <string>       | The user real name (default: 'MeetingBot')
| `commands` | <array>        | A list of command object (see below) defining command to be used during the meeting (Default: `start`, `end` and `help` are defined)
| `output`   | <string>       | Define the output format: `wikimedia`, 'markdown', `HTML`, or `raw` (default: 'raw')
| `l10n`     | <object>       | An l10n object (see below) overriding all the localization options and strings used by the bot.

### Command object

When connected, a bot can handle some commands. All those command can be
customized through command object:

| Property   | Value    | Notes
| ---------- | -------- | --------------
| `type`     | <string> | (Mandatory) There are five type of command : `record` put the msg in a list at the end of the log; `section` start a new section in the minutes; `begin` start recording the meeting; `end` end recording the meeting; `help` provide help on how to use the bot
| `name`     | <string> | (Mandatory) Then human readable name of the command
| `match`    | <string> | A string (which will be turn into a case insensitive RegExp) that must match in a message to call the command (Default: Any message starting with the command's name)
| `call`     | <bool>   | Indicate if the message must be prefix with the name of the bot and a colon to look for the command (default: true)
| `label`    | <string> | The label of the corresponding `record` section within the generated minutes (default: the command's `name`)
| `help`     | <string> | The help text for the command

### l10n object

An l10n object to customized the various bot output. It expect the following
parameters (none is mandatory):

| Property   | Value    | Notes
| ---------- | -------- | --------------
| `locale`   | <string> | The locale code in use (default: en)
| `time`     | <string> | The format for the time record with each IRC message following the [Moment](http://momentjs.com/) syntax (default: 'HH:mm')
| `nohelp`   | <array>  | An array of possible strings to display when no help is available (default: 'Sorry, no help available!')
| `record`   | <array>  | Display when the bot acknowledge a `record` command (Default: 'Record done.')
| `begin`    | <array>  | Display when the bot acknowledge a `begin` command (Default: 'Meeting is recorded now')
| `end`      | <array>  | Display when the bot acknowledge a `end` command (Defaut: 'Meeting is over.')
| `format`   | <array>  | Display when the bot has output the minutes (Default: 'Minutes has been formated.')
| `hi`       | <array>  | Display when the bot join a channel (Default: 'Hi! I'm ready to record your meeting')

Note that every where an array of string is expected, if more than one string
is provide, the string to display is picked at random. On the other end, An
empty array indicate that the bot will remain silent.
