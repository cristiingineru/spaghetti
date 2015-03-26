/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine */


define(['app/part-strip', 'Squire', 'immutable.min', 'app/layoutManager', 'React'], function (Strip, Squire, Immutable, LayoutManager, React) {
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
      it('should contain hols', function () {});
    });

    describe('Strip proto', function () {

    });

    describe('Strip model', function () {
      it('should be an immutable map', function () {
        var model = Strip.model();
        expect(Immutable.Map.isMap(model)).toBe(true);
      });

      var properties = ['proto', 'x', 'y', 'width', 'height', 'holeCount', 'orientation'];

      it('should have ' + properties + ' properties', function () {
        var model = Strip.model();
        properties.forEach(function (property) {
          expect(model.get(property)).toBe(jasmine.anything());
        });
      });
    });
  });
});