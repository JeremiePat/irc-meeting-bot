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
-l --locale   Indicate the locale the bot must use when speaking and recording stuff (Default: 'en')
-f --config   The location of the configuration file to use
```

If used, those command line options always override those set in a
configuration file.

## Configuration

To fine tune your bot, the best way to do it is to set a configuration file.
examples are available in the [conf](./conf) directory. Such configuration is a
json object with the following properties:

| Property   | Value               | Notes
| ---------- | ------------------- | --------------
| `server`   | _string_            | The IRC server to connect to.<br>_Must be set through cli if not define_
| `channels` | _array_ or _string_ | A channel or list of channels the bot must join.<br>_Must be set through cli if not define_
| `port`     | _number_            | The port of the IRC server <br>(Default: 6667)
| `userName` | _string_            | The user name to use <br>(Default: 'MeetingBot')
| `realName` | _string_            | The user real name <br>(Default: 'MeetingBot')
| `commands` | _object_            | A list of named command object (see below) defining command to be used during the meeting <br>(Default: `start`, `end` and `help` are defined)
| `output`   | _string_            | Define the output format: `wikimedia`, `markdown`, `HTML`, or `raw` <br>(Default: 'raw')
| `locale`   | _string_            | The default locale to use (used for time formating and L10NString)<br>(Default: en)
| `speech`   | _object_            | A speech object (see below) to handle the strings to be used when the bot is acknowledging commands

### Command object

When connected, a bot can handle some commands. All those command can be
customized through command object:

| Property   | Value    | Notes
| ---------- | -------- | --------------
| `type`     | _string_ | (Mandatory) There are five type of command : <br>`record` put the msg in a list at the end of the log; <br>`section` start a new section in the minutes; <br>`begin` start recording the meeting; <br>`end` end recording the meeting; <br>`help` provide help on how to use the bot
| `match`    | _string_ | A string (which will be turned into a case insensitive RegExp) to match in a message in order to call the command <br>(Default: Any message starting with the command's name)
| `call`     | _true_ or _false_ | Indicate if the message must be prefix with the name of the bot and a colon to look for the command <br>(Default: true)
| `label`    | _string_ | The label of the corresponding `record` section within the generated minutes <br>(Default: the command's name)
| `help`     | _string_ | The help text for the command, it can be either a string, , an array of string, an L10NString, or an array of L10NString
| `speech`   | _string_ | A speech id (from the speech object below) to handle the bot answers when the command is invoked<br>(Default: the command's type)

> __NOTE:__ _The command's name is the key use to reference the command within
  the object attach to the `commands` property of the configuration object._

### Speech object

A speech object is used to customized the various bot output. Each key of the
object is used as a reference. It can be any key reference by a command object
or one of the keys normalized below.

The value for each key can be either:
 * A string
 * An array of strings
 * An L10NString definition (see below)
 * An array of L10NString definition

If the values are a string or an array of strings, they are considered to be
written in the locale provide by the configuration.

Note that when an array is provided, if it has more than one string, the string
to display is picked at random. On the other hand, An empty array or empty
string indicate that the bot will remain silent.

#### Normalized key:

> __NOTE:__ _Some keys accept parameters. parameters, enclosed within double
  brackets, are placeholder filled automatically_

| Key         | Default                                 | Parameters
| ----------- | --------------------------------------- | -------------------
| `begin`     | Meeting is recorded now.                | _none_
| `end`       | Meeting is over.                        | _none_
| `format`    | Minutes has been formated ({{format}}). | `format`: The format used to produce the minutes
| `help`      | {{help}}                                | `help`: The help string for the requested commands
| `hi`        | Hi! I'm ready to record your meeting    | _none_
| `nohelp`    | Sorry, no help available!               | _none_
| `reconnect` | Sorry, I've been kicked out!            | _none_
| `record`    | Record done.                            | _none_
| `section`   | > {{title}}                             | `title`: The title of the new section


### L10NString object

An L10NString object is a string defined for several locale. It makes easy to
configure bots able to speak different languages.

Such an object is a collection of key/value pairs, where the key is the locale name
and the value the associated string.
