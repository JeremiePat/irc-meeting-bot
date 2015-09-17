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

| Property   | Value               | Notes
| ---------- | ------------------- | --------------
| `server`   | _string_            | (Mandatory) The IRC server to connect to.
| `channels` | _array_ or _string_ | (Mandatory) A channel or list of channels the bot must join
| `port`     | _number_            | The port of the IRC server <br>(Default: 6667)
| `userName` | _string_            | The user name to use <br>(Default: 'MeetingBot')
| `realName` | _string_            | The user real name <br>(Default: 'MeetingBot')
| `commands` | _array_             | A list of command object (see below) defining command to be used during the meeting <br>(Default: `start`, `end` and `help` are defined)
| `output`   | _string_            | Define the output format: `wikimedia`, `markdown`, `HTML`, or `raw` <br>(Default: 'raw')
| `l10n`     | _object_            | An l10n object (see below) overriding all the localization options and strings used by the bot.

### Command object

When connected, a bot can handle some commands. All those command can be
customized through command object:

| Property   | Value    | Notes
| ---------- | -------- | --------------
| `type`     | _string_ | (Mandatory) There are five type of command : <br>`record` put the msg in a list at the end of the log; <br>`section` start a new section in the minutes; <br>`begin` start recording the meeting; <br>`end` end recording the meeting; <br>`help` provide help on how to use the bot
| `name`     | _string_ | (Mandatory) Then human readable name of the command
| `match`    | _string_ | A string (which will be turn into a case insensitive RegExp) that must match in a message to call the command <br>(Default: Any message starting with the command's name)
| `call`     | _true_ or _false_ | Indicate if the message must be prefix with the name of the bot and a colon to look for the command <br>(Default: true)
| `label`    | _string_ | The label of the corresponding `record` section within the generated minutes <br>(Default: the command's `name`)
| `help`     | _string_ | The help text for the command

### l10n object

An l10n object to customized the various bot output. It expect the following
parameters (none is mandatory):

| Property   | Value    | Notes
| ---------- | -------- | --------------
| `locale`   | _string_ | The locale code in use <br>(Default: en)
| `time`     | _string_ | The format for the time record with each IRC message following the [Moment](http://momentjs.com/) syntax <br>(Default: 'HH:mm')
| `nohelp`   | _array_  | An array of possible strings to display when no help is available <br>(Default: 'Sorry, no help available!')
| `record`   | _array_  | Display when the bot acknowledge a `record` command <br>(Default: 'Record done.')
| `begin`    | _array_  | Display when the bot acknowledge a `begin` command <br>(Default: 'Meeting is recorded now')
| `end`      | _array_  | Display when the bot acknowledge a `end` command <br>(Defaut: 'Meeting is over.')
| `format`   | _array_  | Display when the bot has output the minutes <br>(Default: 'Minutes has been formated.')
| `hi`       | _array_  | Display when the bot join a channel <br>(Default: 'Hi! I'm ready to record your meeting')

Note that every where an array of string is expected, if more than one string
is provide, the string to display is picked at random. On the other end, An
empty array indicate that the bot will remain silent.
