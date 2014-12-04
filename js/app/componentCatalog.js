/* global define */
/* jshint -W104 */

define(['app/core'], function (core) {

  var privateCatalog = [];

  DefaultSizes = function () {};
  DefaultSizes.prototype.bodyHeight = 50;
  this.bodyWidth = 20;
  this.legHeight = 40;
  this.legWidth = 3;
  this.fingerRadius = 8;
  this.cornerRadius = 3;

  function Coordinates() {
    this.x = 0;
    this.y = 0;
  }

  function Moveable() {
    this.move = function (x, y) {
      this.x = x;
      this.y = y;
      if (this.view) {
        this.view.move(x, y);
      }
    };
  }

  function Drawable() {
    this.draw = function (svg) {
      this.defaultDraw(svg);
      if (this.ondraw) {
        this.ondraw();
      }
    };
  }

  function Draggable() {
    this.draggable = true;
    if (this.view) {
      this.view.draggable();
    } else {
      this.ondraw = function () {
        this.view.draggable();
      };
    }
  }

  privateCatalog.push({

    name: 'resistor',

    create: function () {

      var defaultDraw = function (svg) {

        var leg1 = svg.rect(model.legWidth, model.legHeight)
          .move(-model.legWidth / 2, -(model.bodyHeight / 2 + model.legHeight));
        var leg2 = svg.rect(model.legWidth, model.legHeight)
          .move(-model.legWidth / 2, (model.bodyHeight / 2));


        var finger1_original_relative_x = -model.fingerRadius / 2;
        var finger1_original_relative_y = -(model.bodyHeight / 2 + model.legHeight + model.fingerRadius / 2);

        var finger1 = svg.circle(model.fingerRadius, model.fingerRadius)
          .move(-model.fingerRadius / 2, -(model.bodyHeight / 2 + model.legHeight + model.fingerRadius / 2))
          .draggable(function (x, y) {

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
          .move(-model.fingerRadius / 2, (model.bodyHeight / 2 + model.legHeight - model.fingerRadius / 2));
        var body = svg.rect(model.bodyWidth, model.bodyHeight)
          .radius(model.cornerRadius)
          .move(-model.bodyWidth / 2, -model.bodyHeight / 2);

        var view = svg.group()
          .add(leg1)
          .add(leg2)
          .add(finger1)
          .add(finger2)
          .add(body);

        this.view = view;

        return view;
      };


      function Model() {
        this.defaultDraw = defaultDraw;
        //DefaultSizes.apply(this);
        //Coordinates.apply(this);
        //Moveable.apply(this);
        //Drawable.apply(this);
        //Draggable.apply(this);

        core.mixin(DefaultSizes, this);
        core.mixin(Coordinates, this);
        core.mixin(Moveable, this);
        core.mixin(Drawable, this);
        core.mixin(Draggable, this);

        return this;
      }

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