'use strict';

// Format IRC log with MarkDown
// ----------------------------------------------------------------------------
module.exports = {
  name      : 'MarkDown',
  extension : 'md',
  format    : function (log) {
    var r, output = [
      log.title,
      '==========================================\n'
    ];

    log.raw.forEach(function (line, i) {
      if (log.sections[i]) {
        output.push('\n## ' + log.sections[i]);
      }

      output.push(
        '* (_' + line.time + '_)' +
        ' __'  + line.nick + ':__' +
        ' '    + line.msg
      );
    });

    function listRecord(line) {
      output.push(
        '* ' + line
      );
    }

    for (r in log.records) {
      if (log.records.hasOwnProperty(r)) {
        output.push('\n## ' + r);

        log.records[r].forEach(listRecord);
      }
    }

    return output.join('\n');
  }
};
