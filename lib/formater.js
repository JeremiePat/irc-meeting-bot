'use strict';

// Modules needed
// ----------------------------------------------------------------------------
var path   = require('path');
var fs     = require('fs');
var mkdir  = require('mkdirp');
var moment = require('moment');
var loggy  = require('loggy');

// Default format definition
// ----------------------------------------------------------------------------
var DEFAULT_RAW_FORMAT = {
  name      : 'Plain Text',
  extension : 'txt',
  format    : function (log) {
    var r,
    output = [
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

    for (r in log.records) {
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
function Formater(type, dir) {
  this.setFormat(type);
  this.dir = path.resolve(dir);
}

Formater.prototype.setFormat = function (format) {
  var src, f;

  if (typeof format === 'string') {
    src = './format/' + format.toLowerCase();

    try {
      f = require(src);
      format = f;
    } catch (e) {}
  }

  // Check format object signature
  if (format.format && typeof format.format === 'function' &&
      format.extension &&
      format.name) {
    this.format = format;
  }

  else {
    loggy.warn('Unknown formater:', format);

    if (!this.format) {
      loggy.warn('Default plain text formater will be used');
      this.format = DEFAULT_RAW_FORMAT;
    }

    else {
      loggy.warn('The existing formater is kept:', this.format.name);
    }
  }
};

Formater.prototype.render = function render(log) {
  var content, fileName  = [
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

  fileName = path.join(this.dir, fileName);
  content  = this.format.format.call(this, log);

  mkdir(this.dir, function (err) {
    if (err) {
      loggy.error('Error while accessing log directory:', err);
    }

    fs.writeFile(fileName, content, function (err) {
      if (err) {
        loggy.error('Error while writing minutes:', err);
      }
    });
  });
};

// Expose Formater module
// ----------------------------------------------------------------------------
module.exports = Formater;
