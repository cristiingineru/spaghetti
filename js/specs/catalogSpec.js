/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine */


define(['app/catalog'], function (Catalog) {
  describe('Catalog', function () {
    it('should return an array with components', function () {
      var components = Catalog();
      expect(components.length).toBeGreaterThan(0);
    });

    it('should return a fresh array on each call', function () {
      var firstComponents = Catalog();
      var secondComponents = Catalog();
      expect(secondComponents).not.toBe(firstComponents);
    });
  });
});