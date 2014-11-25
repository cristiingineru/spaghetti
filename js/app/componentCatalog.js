/* global define */
/* jshint -W104 */

define(function () {

  var privateCatalog = [];

  //var x = 100, y = 100;
  var bodyHeight = 50;
  var bodyWidth = 20;
  var legHeight = 40;
  var legWidth = 3;
  var fingerRadius = 8;
  var cornerRadius = 3;

  privateCatalog.push({

    name: 'resistor',

    create: function (svg, x, y) {

      var leg1 = svg.rect(legWidth, legHeight)
        .move(x - legWidth / 2, y - (bodyHeight / 2 + legHeight));
      var leg2 = svg.rect(legWidth, legHeight)
        .move(x - legWidth / 2, y + (bodyHeight / 2));
      var finger1 = svg.circle(fingerRadius, fingerRadius)
        .move(x - fingerRadius / 2, y - (bodyHeight / 2 + legHeight + fingerRadius / 2));
      var finger2 = svg.circle(fingerRadius, fingerRadius)
        .move(x - fingerRadius / 2, y + (bodyHeight / 2 + legHeight - fingerRadius / 2));
      var body = svg.rect(bodyWidth, bodyHeight)
        .radius(cornerRadius)
        .move(x - bodyWidth / 2, y - bodyHeight / 2);

      var component = svg.group()
        .add(leg1)
        .add(leg2)
        .add(finger1)
        .add(finger2)
        .add(body);

      return component;
    }

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