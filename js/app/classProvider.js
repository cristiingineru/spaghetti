/* global define */
/* jshint -W104 */

define([
  'app/diagram',
  'app/palette',
  'app/component-breadboard',
  'app/component-resistor',
  'app/component-capacitor',
  'app/part-body',
  'app/part-leg',
  'app/part-finger',
  'app/part-strip',
  'app/part-hole'],
  function () {

    var privateCatalog = Array.prototype.slice.call(arguments).map(function (componentOrPart) {
      return {
        name: componentOrPart.name && componentOrPart.name(),
        class: componentOrPart.class(),
        model: componentOrPart.model()
      };
    });

    var findByName = function (name) {
      var componentInCatalog = privateCatalog.filter(function (component) {
        if (component.name === name) {
          return true;
        }
        return false;
      });
      return componentInCatalog[0];
    };

    return function (nameOrModel) {
      var found;
      if (typeof nameOrModel === 'string' || nameOrModel instanceof String) {
        found = findByName(nameOrModel).class;
      } else {
        nameOrModel = nameOrModel.get('name');
        found = findByName(nameOrModel).class;
      }
      return found;
    };
  });