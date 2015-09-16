'use strict';

// Format IRC log with HTML
// ----------------------------------------------------------------------------
module.exports = {
  name      : 'HTML',
  extension : 'html',
  format    : function (log) {
    var output = [
      '<!DOCTYPE html>',
      '<html lang="' + log.l10n.locale + '">',
      '<head>',
      '  <meta charset="utf-8">',
      '  <title>' + log.title + '</title>',
      '</head>',
      '<body>',
      '<article>',
      '  <h1>' + log.title + '</h1>'
    ];

    var sectionNumber = 0;
    log.raw.forEach(function (line, i) {
      if (log.sections[i]) {
        if (sectionNumber > 0) {
          output.push('    </ul>');
          output.push('  </section>');
        } else if (i > 0) {
          output.push('  </ul>');
        }
        sectionNumber += 1;
        output.push('  <section id="s' + sectionNumber + '">');
        output.push('    <h2>' + log.sections[i] + '</h2>');
        output.push('    <ul>');
      } else if (i === 0) {
        output.push('  <ul>');
      }

      output.push('      <li>');
      output.push('        <span id="a' + i + '"><time>' + line.time + '</time> <b>'  + line.nick + '</b></span>');
      output.push('        <q aria-labeledby="a' + i + '">' + line.msg + '</q>');
      output.push('      <li>');
    });

    function listRecord(line) {
      output.push(
        '      <li>' + line + '</li>'
      );
    }

    for (var r in log.records) {
      if (log.records.hasOwnProperty(r)) {
        if (sectionNumber > 0) {
          output.push('    </ul>');
          output.push('  </section>');
        } else {
          output.push('  </ul>');
        }
        sectionNumber += 1;
        output.push('  <section id="s' + sectionNumber + '">');
        output.push('    <h2>' + r + '</h2>');
        output.push('    <ul>');

        log.records[r].forEach(listRecord);
      }
    }

    if (sectionNumber > 0) {
      output.push('    </ul>');
      output.push('  </section>');
    }

    // There's an edge case here if there is only records and no raw log
    else if (log.row.length > 0) {
      output.push('  </ul>');
    }

    output.push('</article>');
    output.push('</body>');
    output.push('</html>');

    return output.join('\n');
  }
};
