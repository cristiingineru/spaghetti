/* global define */
/* jshint -W104 */

var catalog;

define([
  'app/component-resistor',
  'app/component-capacitor'],
  function () {

    var components = Array.prototype.slice.call(arguments);

    var Catalog = function () {};

    Catalog.prototype.components = function () {
      return components.slice(0);
    };

    catalog = new Catalog();

    return Catalog;
  });