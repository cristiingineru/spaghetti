/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine */


define(['app/palette', 'React', 'app/catalog', 'app/classProvider', 'app/part-body'], function (Palette, React, Catalog, ClassProvider, Body) {
  describe('Palette', function () {
    it('should provide a known API', function () {
      expect(typeof (Palette.name)).toBe('function');
      expect(typeof (Palette.name())).toBe('string');

      expect(typeof (Palette.class)).toBe('function');
      expect(Palette.class).not.toThrow();

      expect(typeof (Palette.proto)).toBe('function');
      expect(Palette.proto).not.toThrow();

      expect(typeof (Palette.model)).toBe('function');
      expect(Palette.model).not.toThrow();
    });

    var getCatalog = function () {
      return new Catalog();
    };

    describe('Palette class', function () {

      var TestUtils = React.addons.TestUtils;
      var renderDefaultPalette = function () {
        var p = React.createElement(Palette.class(), {
          model: Palette.model()
        });
        return TestUtils.renderIntoDocument(p);
      };
      var components = function () {
        return getCatalog().components();
      };
      var renderedComponentsIn = function (container) {
        var arraysOfComponents = catalog.components().map(function (component) {
          return TestUtils.scryRenderedComponentsWithType(container, component.class());
        });
        return [].concat.apply([], arraysOfComponents);
      };

      it('should render at least one component', function () {
        var palette = renderDefaultPalette();
        var bodies = TestUtils.scryRenderedComponentsWithType(palette, Body.class());
        expect(bodies.length).toBeGreaterThan(0);
      });

      it('should not render components one on top of each other', function () {
        var palette = renderDefaultPalette();
        var bodies = TestUtils.scryRenderedComponentsWithType(palette, Body.class());
        bodies.forEach(function (b1) {
          var x1 = b1.getDOMNode().attributes.x;
          var y1 = b1.getDOMNode().attributes.y;
          bodies.forEach(function (b2) {
            if (b1 !== b2) {
              var x2 = b2.getDOMNode().attributes.x;
              var y2 = b2.getDOMNode().attributes.y;
              var samePosition = (x1.value === x2.value) && (y1.value === y2.value);
              expect(samePosition).toBe(false);
            }
          });
        });
      });

      it('should create a palette item in front of each component', function () {
        var palette = renderDefaultPalette();
        var components = renderedComponentsIn(palette);
        var items = TestUtils.scryRenderedComponentsWithType(palette, Palette.paletteItemClass());
        expect(items.length).toBe(components.length);
        components.forEach(function (component) {
          var cx = component.props.model.get('x'),
            cy = component.props.model.get('y'),
            cwidth = component.props.model.get('width'),
            cheight = component.props.model.get('height');
          items.forEach(function (handler) {
            if (handler.props.owner === component.props.model) {
              var hx = handler.getDOMNode().attributes.x.value,
                hy = handler.getDOMNode().attributes.y.value,
                hwidth = handler.getDOMNode().attributes.width.value,
                hheight = handler.getDOMNode().attributes.height.value;

              // this needs to be done with some helper methods:
              //expect(component.getBBox()).toBeInside(item.getBBox());
              expect(cx).toBeGreaterThan(hx);
              expect(cx).toBeLessThan(hx + hwidth);
              expect(cy).toBeGreaterThan(hy);
              expect(cy).toBeLessThan(hy + hheight);
            }
          });
        });
      });
    });

    describe('Palette model', function () {
      it('should contain a prototype of each component', function () {
        var paletteComponents = Palette.model().get('components'),
          catalogComponents = getCatalog().components();
        expect(paletteComponents.count()).toBe(catalogComponents.length);
      });
    });
  });
});