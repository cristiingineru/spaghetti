/* global define */
/* jshint -W104 */

define(['app/core', 'app/component-breadboard', 'app/component-resistor', 'app/component-capacitor'], function (core, componentBreadboard, componentResistor, componentCapacitor) {

  var privateCatalog = [];

  privateCatalog.push({
    name: componentBreadboard.name,
    class: componentBreadboard.class,
    model: componentBreadboard.model
  });
  privateCatalog.push({
    name: componentResistor.name,
    class: componentResistor.class,
    model: componentResistor.model
  });
  privateCatalog.push({
    name: componentCapacitor.name,
    class: componentCapacitor.class,
    model: componentCapacitor.model
  });

  var findByName = function (name) {
    var componentInCatalog = privateCatalog.filter(function (component) {
      if (component.name() === name) {
        return true;
      }
      return false;
    });
    return componentInCatalog[0];
  };

  return function (nameOrModel) {
    var found = null;
    if (typeof nameOrModel === 'string' || nameOrModel instanceof String) {
      return findByName(nameOrModel);
    } else {
      nameOrModel = nameOrModel.get('name');
      return findByName(nameOrModel);
    }
    return null;
  };
});