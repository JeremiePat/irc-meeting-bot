'use strict';

// Modules needed
// ----------------------------------------------------------------------------
var loggy = require('loggy');
var _ = require('underscore');
var L10NString = require('./l10n.string');

// Utils
// ----------------------------------------------------------------------------
function rdm(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// The StringManager object
// ----------------------------------------------------------------------------
function StringManager(setList, locale) {
  this.strings = {};

  _.each(setList, (function (strings, id) {
    this.addStringSet(id, strings, locale);
  }).bind(this));
}

StringManager.prototype.addStringSet = function (id, stringSet, locale) {
  if (!_.isArray(stringSet)) {
    stringSet = [stringSet];
  }

  loggy.info('Set speech for', id);

  this.strings[id] = _.map(stringSet, function (str) {
    return new L10NString(str, locale);
  });
};

StringManager.prototype.getString = function (id, param, locale) {
  var str;

  if (!this.strings[id]) { return ''; }

  str = this.strings[id][rdm(0, this.strings[id].length)];

  if (!(str instanceof L10NString)) { return ''; }

  return str
    .toString(locale)
    .replace(/\{\{([a-zA-Z]+)\}\}/g, function (match, key) {
      return (param && param[key]) || key;
    });
};

// Expose L10N module
// ----------------------------------------------------------------------------
module.exports = StringManager;
