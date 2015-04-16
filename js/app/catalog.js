/* global define */
/* jshint -W104 */

define([
  'app/component-resistor',
  'app/component-capacitor'],
  function () {

    var privateCatalog = Array.prototype.slice.call(arguments);

    return function () {
      var clone = privateCatalog.slice(0);
      return clone;
    };
  });