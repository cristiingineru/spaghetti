/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine */


define(['app/part-strip', 'Squire', 'immutable.min', 'app/layoutManager', 'React', 'app/keyProvider', 'app/part-hole'], function (Strip, Squire, Immutable, LayoutManager, React, KeyProvider, Hole) {
  describe('Strip', function () {
    it('should provide a known API', function () {
      expect(typeof (Strip.class)).toBe('function');
      expect(Strip.class).not.toThrow();

      expect(typeof (Strip.proto)).toBe('function');
      expect(Strip.proto).not.toThrow();

      expect(typeof (Strip.model)).toBe('function');
      expect(Strip.model).not.toThrow();
    });

    describe('Strip class', function () {

      var TestUtils = React.addons.TestUtils;
      var renderStrip = function (orientation, holeCount) {
        var model = Strip.model().objectify()
          .keyify(KeyProvider)
          .setOrientation(orientation)
          .setHoleCount()
          .model(),
          strip = React.createElement(Strip.class(), {
            model: model
          });
        return TestUtils.renderIntoDocument(strip);
      };

      it('should contain holes', function () {
        var strip = renderStrip();
        var holes = TestUtils.scryRenderedComponentsWithType(strip, Hole.class());
        expect(holes.length).toBeGreaterThan(0);
      });
    });

    describe('Strip proto', function () {
      it('should set a key to itself and to its child parts', function () {
        var hardCodedUniqueKey = 9999,
          keyProvider = jasmine.createSpy('keyProvider').and.returnValue(hardCodedUniqueKey);

        var model = Strip.model().objectify()
          .keyify(keyProvider)
          .model();

        expect(keyProvider).toHaveBeenCalled();
        expect(model.get('key')).toBe(hardCodedUniqueKey);
      });

      it('should adapt the size acordingly to the hole count', function () {
        var holeCounts = [1, 2, 5];

        holeCounts.forEach(function (holeCount) {
          var model = Strip.model().objectify()
            .setOrientation('horizontal')
            .setHoleCount(holeCount)
            .model();

          expect(model.get('holeCount')).toBe(holeCount);
        });
      });

      it('should change the sizes accordingly to orientation', function () {
        var orientations = ['horizontal', 'vertical'];

        orientations.forEach(function (orientation) {
          var model = Strip.model().objectify()
            .setOrientation('horizontal')
            .setHoleCount(3)
            .model();

          expect(model.get('orientation')).toBe(orientation);
        });
      });
    });

    describe('Strip model', function () {
      it('should be an immutable map', function () {
        var model = Strip.model();
        expect(Immutable.Map.isMap(model)).toBe(true);
      });

      var properties = ['x', 'y', 'width', 'height', 'holeCount', 'orientation', 'holes', 'proto'];

      it('should have ' + properties + ' properties', function () {
        var model = Strip.model();
        properties.forEach(function (property) {
          var value = model.get(property),
            condition = value !== null && value !== undefined;
          expect(condition).toBe(true);
        });
      });
    });
  });
});