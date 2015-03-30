/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine */


define(['app/component-breadboard', 'Squire', 'immutable.min', 'app/layoutManager', 'React', 'app/part-strip', 'app/keyProvider'], function (Breadboard, Squire, Immutable, LayoutManager, React, Strip, KeyProvider) {
  describe('Breadboard', function () {
    it('should provide a known API', function () {
      expect(typeof (Breadboard.name)).toBe('function');
      expect(typeof (Breadboard.name())).toBe('string');

      expect(typeof (Breadboard.class)).toBe('function');
      expect(Breadboard.class).not.toThrow();

      expect(typeof (Breadboard.proto)).toBe('function');
      expect(Breadboard.proto).not.toThrow();

      expect(typeof (Breadboard.model)).toBe('function');
      expect(Breadboard.model).not.toThrow();
    });

    describe('Breadboard class', function () {

      var TestUtils = React.addons.TestUtils;
      var renderBreadboard = function () {
        var model = Breadboard.model().objectify()
          .keyify(KeyProvider)
          .model(),
          breadboard = React.createElement(Breadboard.class(), {
            model: model
          });
        return TestUtils.renderIntoDocument(breadboard);
      };

      it('should render strips', function () {
        var breadboard = renderBreadboard();
        var strips = TestUtils.scryRenderedComponentsWithType(breadboard, Strip.class());
        expect(strips.length).toBeGreaterThan(0);
      });
    });

    describe('Breadboard proto', function () {
      xit('should have a keyify function that set a unique key to itself and child parts', function () {});
      xit('should have an init function that personalize the child parts', function (done) {});
    });

    describe('Breadboard model', function () {
      it('should be an immutable map', function () {
        var model = Breadboard.model();
        expect(Immutable.Map.isMap(model)).toBe(true);
      });

      it('should have name, proto, x and y properties', function () {
        var model = Breadboard.model();
        expect(model.get('name')).not.toBeFalsy();
        expect(model.get('proto')).not.toBeFalsy();
        expect(model.get('x')).toEqual(jasmine.any(Number));
        expect(model.get('y')).toEqual(jasmine.any(Number));
      });
    });

  });
});