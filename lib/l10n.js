'use strict';

// Modules needed
// ----------------------------------------------------------------------------
var moment = require('moment');

// Utils
// ----------------------------------------------------------------------------
function rdm(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// The L10N object
// ----------------------------------------------------------------------------
function L10N(cfg) {
  cfg = cfg || {};

  this.locale = String(cfg.locale || 'en');
  this.time   = String(cfg.time || 'HH:mm');
  this.str    = {};

  [{
    id : 'nohelp',
    str: ['Sorry, no help available!']
  },{
    id : 'record',
    str: ['Record done.']
  },{
    id : 'begin',
    str: ['Meeting is recorded now.']
  },{
    id : 'end',
    str: ['Meeting is over.']
  },{
    id : 'format',
    str: ['Minutes has been formated.']
  },{
    id : 'hi',
    str: ['Hi! I\'m ready to record your meeting']
  }].forEach((function (base) {
    var val = cfg[base.id];

    if (val && typeof val === 'string') {
      val = val.length > 0 ? [val] : [];
    }

    this.str[base.id] = Array.isArray(val) ? val : base.str;
  }).bind(this));
}

L10N.prototype._ = function (id) {
  var str,
      now = moment().locale(this.locale);

  if (id === 'time') {
    return now.format(this.time);
  }

  if (id === 'date') {
    return now.format('L');
  }

  if (id in this.str) {
    str = this.str[id];
    return str[rdm(0, str.length)];
  }

  return id;
};

// Expose L10N module
// ----------------------------------------------------------------------------
module.exports = L10N;
