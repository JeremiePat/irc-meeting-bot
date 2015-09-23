'use strict';

// Modules needed
// ----------------------------------------------------------------------------
var _ = require('underscore');
var moment = require('moment');

// Utils
// ----------------------------------------------------------------------------
var LANG_RGX = /^[a-z]{2}(?:-[a-z]{2})$/i;

// The L10N Object
// ----------------------------------------------------------------------------
function L10N(locale) {
  this.locale = 'en';
  this.setLocale(locale);
  this.format = {
    date: 'L',
    time: 'HH:mm'
  };
}

L10N.prototype.setLocale = function setLocale(locale) {
  if (_.isString(locale) && LANG_RGX.test(locale)) {
    this.locale = locale.toLowerCase();
  }
};

L10N.prototype.getMoment = function getMoment() {
  var format = _.isString(arguments[0]) ? arguments[0] :
               _.isString(arguments[1]) ? arguments[1] :
               undefined;

  var time = _.isDate(arguments[0]) ? arguments[0] :
             _.isDate(arguments[1]) ? arguments[1] :
             undefined;

  return moment(time).locale(this.locale).format(format);
};

L10N.prototype.getDate = function getDate() {
  return this.getMoment(this.format.date);
};

L10N.prototype.getTime = function getTime() {
  return this.getMoment(this.format.time);
};

// Expose L10N module
// ----------------------------------------------------------------------------
module.exports = L10N;
