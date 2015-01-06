/* global define */
/* jshint -W104 */

define(['app/core', 'app/component-resistor'], function (core, componentResistor) {

  var privateCatalog = [];

  privateCatalog.push({

    name: componentResistor.name,
    class: componentResistor.class,
    model: componentResistor.model
  });

  function findByName(name) {
    var found = null;
    for (var component of privateCatalog) {
      if (component.name() === name) {
        return component;
      }
    }
    return null;
  }

  return function (nameOrModel) {
    var found = null;
    if (typeof nameOrModel === 'string' || nameOrModel instanceof String) {
      return findByName(nameOrModel);
    }
    else {
      nameOrModel = nameOrModel.get('name');
      return findByName(nameOrModel);
    }
    return null;
  };
});