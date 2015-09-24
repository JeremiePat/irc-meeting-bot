'use strict';

// Modules needed
// ----------------------------------------------------------------------------
var _ = require('underscore');

// Utils
// ----------------------------------------------------------------------------
var LANG_RGX = /^[a-z]{2}(?:-[a-z]{2})$/i;

// L10NString object
// ----------------------------------------------------------------------------
function L10NString(str, locale) {
  this.locale = 'en';
  this.setDefaultLocale(locale);

  if (_.isString(str)) {
    this[this.locale] = str;
  }

  else {
    _.each(str, (function (s, l) {
      l = String(l).toLowerCase();
      if (LANG_RGX.test(l)) {
        this[l] = s;
      }
    }).bind(this));
  }
}

// Allow all String function to work with L10NString (still it isn't a string)
_.each(String.prototype, function (fn, name) {
  L10NString.prototype[name] = function () {
    return fn.apply(this.toString(), arguments);
  };
});

L10NString.prototype.toString = function toString(locale) {
  return (LANG_RGX.test(locale) && this[locale]) || this[this.locale] || '';
};

L10NString.prototype.addLocaleString = function addLocaleString(str, locale) {
  if (_.isString(str) && LANG_RGX.test(locale)) {
    this[String(locale).toLowerCase()] = str;
    return true;
  }

  return false;
};

L10NString.prototype.setDefaultLocale = function setDefaultLocale(locale) {
  if (LANG_RGX.test(locale)) {
    this.locale = String(locale).toLowerCase();
  }
};

// Expose L10NString module
// ----------------------------------------------------------------------------
module.exports = L10NString;
