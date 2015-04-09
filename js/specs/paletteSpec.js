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

    describe('Palette class', function () {

      var TestUtils = React.addons.TestUtils;
      var renderDefaultPalette = function () {
        var p = React.createElement(Palette.class(), {
          model: Palette.model()
        });
        return TestUtils.renderIntoDocument(p);
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
    });

    describe('Palette model', function () {
      it('should contain a prototype of each component', function () {
        var paletteComponents = Palette.model().get('components'),
          catalogComponents = Catalog();
        expect(paletteComponents.count()).toBe(catalogComponents.length);
      });
    });
  });
});