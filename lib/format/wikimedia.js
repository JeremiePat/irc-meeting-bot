'use strict';

// Format IRC log with WikiMedia syntaxe
// ----------------------------------------------------------------------------
module.exports = {
  name      : 'WikiMedia',
  extension : 'txt',
  format    : function (log) {
    var output = ['==' + log.title + '=='];

    log.raw.forEach(function (line, i) {
      if (log.sections[i]) {
        output.push('\n===' + log.sections[i] + '===');
      }

      output.push(
        '* (\'\'' + line.time + '\'\')' +
        ' \'\'\'' + line.nick + ':\'\'\'' +
        ' ' + line.msg.replace(/(\{\{.*\}\})/g, '<nowiki>$1</nowiki>')
      );
    });

    function listRecord(line) {
      output.push(
        '* ' + line
      );
    }

    for (var r in log.records) {
      if (log.records.hasOwnProperty(r)) {
        output.push('\n===' + r + '===');

        log.records[r].forEach(listRecord);
      }
    }

    return output.join('\n');
  }
};
