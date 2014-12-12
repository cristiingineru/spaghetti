/* global define */
/* jshint -W104 */

define(['app/core', 'app/component-resistor'], function (core, componentResistor) {

  var privateCatalog = [];

  privateCatalog.push({

    name: 'resistor',
    class: componentResistor.class,
    model: componentResistor.model
  });

  return function (name) {
    var found = null;
    for (var component of privateCatalog) {
      if (component.name === name) {
        return component;
      }
    }
    return null;
  };
});