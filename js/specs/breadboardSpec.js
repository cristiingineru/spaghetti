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

    [{
      pattern: [
        '1*5v',
        '',
        '2*5h'
      ].join('\n'),
      stripCount: 3,
      holeCount: 15
    }, {
      pattern: [
        '1*5v',
        '2*5h'
      ].join('\n'),
      stripCount: 3,
      holeCount: 15
    }, {
      pattern: '1*5v',
      stripCount: 1,
      holeCount: 5
    }, {
      pattern: '2*3h',
      stripCount: 2,
      holeCount: 6
    }].forEach(function (test) {
      it('should build a new breadboard with ' + test.pattern + ' pattern', function () {
        var model = Breadboard.model(test.pattern);

        var strips = model.get('strips'),
          holes = strips.map(function (strip) {
            return strip.get('holes');
          });
        holes = (new Immutable.List(holes)).flatten(1);
        expect(strips.count()).toBe(test.stripCount);
        expect(holes.count()).toBe(test.holeCount);
      });
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

      it('should have name, proto, x, y, width, height and strips properties', function () {
        var model = Breadboard.model();
        expect(model.get('name')).not.toBeFalsy();
        expect(model.get('proto')).not.toBeFalsy();
        expect(model.get('x')).toEqual(jasmine.any(Number));
        expect(model.get('y')).toEqual(jasmine.any(Number));
        expect(model.get('width')).toEqual(jasmine.any(Number));
        expect(model.get('height')).toEqual(jasmine.any(Number));
        expect(model.get('strips')).not.toBeFalsy();
      });

      it('should have the width and height containing all the strips', function () {
        var pattern = [
          '3*10h',
          '',
          '1*2v'
        ].join('\n'),
          unitSize = 14,
          expectedWidth = 30 * unitSize,
          expectedHeight = 4 * unitSize;

        var model = Breadboard.model(pattern),
          width = model.get('width'),
          height = model.get('height');

        var deltaWidth = Math.abs(width - expectedWidth),
          deltaHeight = Math.abs(height - expectedHeight),
          acceptedTolerance = unitSize;
        expect(deltaWidth).toBeLessThan(acceptedTolerance);
        expect(deltaHeight).toBeLessThan(acceptedTolerance);
      });
    });

  });
});