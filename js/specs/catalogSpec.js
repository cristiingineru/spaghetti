/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine */


define(['app/catalog'], function (Catalog) {
  describe('Catalog', function () {
    it('should return an array with components', function () {
      var catalog = new Catalog();

      expect(catalog.components().length).toBeGreaterThan(0);
    });

    it('should return a fresh array on each call', function () {
      var catalog = new Catalog();

      var firstComponents = catalog.components(),
        secondComponents = catalog.components();

      expect(secondComponents).not.toBe(firstComponents);
    });
  });
});