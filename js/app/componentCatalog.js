/* global define */
/* jshint -W104 */

define(function () {

  var privateCatalog = [];

  function DefaultSizes() {
    this.bodyHeight = 50;
    this.bodyWidth = 20;
    this.legHeight = 40;
    this.legWidth = 3;
    this.fingerRadius = 8;
    this.cornerRadius = 3;
  }

  privateCatalog.push({

    name: 'resistor',

    create: function (x, y) {

      var draw = function (svg) {

        var leg1 = svg.rect(model.legWidth, model.legHeight)
          .move(x - model.legWidth / 2, y - (model.bodyHeight / 2 + model.legHeight));
        var leg2 = svg.rect(model.legWidth, model.legHeight)
          .move(x - model.legWidth / 2, y + (model.bodyHeight / 2));
  
        
        var finger1_original_relative_x = x + model.fingerRadius / 2;
        var finger1_original_relative_y = y - (model.bodyHeight / 2 + model.legHeight + model.fingerRadius / 2);
                            
        var finger1 = svg.circle(model.fingerRadius, model.fingerRadius)
          .move(x - model.fingerRadius / 2, y - (model.bodyHeight / 2 + model.legHeight + model.fingerRadius / 2))
          .draggable(function(x, y) {
            
            var parentBox = finger1.parent.bbox();
            var relative_delta_x = finger1_original_relative_x;
            var relative_delta_y = finger1_original_relative_y;
            
            return {
              x: relative_delta_x - 50 < x && x < relative_delta_x + 50,
              y: relative_delta_y - 50 < y && y < relative_delta_y + 50
            };
          });
        

        finger1.beforedrag = function (event) {
          event.stopPropagation();
        };

        var finger2 = svg.circle(model.fingerRadius, model.fingerRadius)
          .move(x - model.fingerRadius / 2, y + (model.bodyHeight / 2 + model.legHeight - model.fingerRadius / 2));
        var body = svg.rect(model.bodyWidth, model.bodyHeight)
          .radius(model.cornerRadius)
          .move(x - model.bodyWidth / 2, y - model.bodyHeight / 2);

        var view = svg.group()
          .add(leg1)
          .add(leg2)
          .add(finger1)
          .add(finger2)
          .add(body);

        return view;
      };


      function Model() {
        DefaultSizes.apply(this);
        this.draw = draw;
        return this;
      };
      
      Model.prototype = DefaultSizes.prototype;
      
      var model = new Model();

      return model;
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