'use strict';

// Modules needed
// ----------------------------------------------------------------------------
var fs     = require('fs');
var moment = require('moment');
var loggy  = require('loggy');

// Default format definition
// ----------------------------------------------------------------------------
var DEFAULT_RAW_FORMAT = {
  name      : 'Plain Text',
  extension : 'txt',
  format    : function (log) {
    var output = [
      log.title,
      '------------------------------------------'
    ];

    log.raw.forEach(function (line, i) {
      if (log.sections[i]) {
        output.push('\n' + log.sections[i]);
      }

      output.push(
        '(' + line.time + ')' +
        ' ' + line.nick + ':' +
        ' ' + line.msg
      );
    });

    function listRecord(line) {
      output.push(
        line
      );
    }

    for (var r in log.records) {
      if (log.records.hasOwnProperty(r)) {
        output.push('\n' + r);

        log.records[r].forEach(listRecord);
      }
    }

    return output.join('\n');
  }
};

// Formater object;
// ----------------------------------------------------------------------------
function Formater(type) {
  this.setFormat(type);
}

Formater.prototype.setFormat = function(format) {
  if (typeof format === 'string') {
    var src = './format/' + format.toLowerCase();

    try {
      var f = require(src);
      format = f;
    } catch (e) {}
  }

  if (format.format && typeof format.format === 'function' &&
      format.extension && format.name) {
    this.format = format;
  } else {
    if (!this.format) {
      loggy.warn('Unknown formater! Default plain text formater will be used');
      this.format = DEFAULT_RAW_FORMAT;
    } else {
      loggy.warn('Unknown formater! Keep the existing one:', this.format.name);
    }
  }
};

Formater.prototype.render = function render(log) {
  var fileName  = [
    'meeting',
    log.channel,
    moment().locale(log.l10n.locale).format('YYYYMMDD'),
    this.format.extension
  ].join('.');

  loggy.info(
    'Formating minutes',
    '(' + this.format.name + ')',
    ':', fileName
  );

  fs.writeFile(fileName, this.format.format.call(this, log), function (err) {
    if (err) {
      loggy.error('Error while writing minutes:', err);
    }
  });
};

// Expose Formater module
// ----------------------------------------------------------------------------
module.exports = Formater;
