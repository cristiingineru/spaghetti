/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine */


define(['app/palette', 'app/catalog'], function (Palette, Catalog) {
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

    describe('Palette model', function () {
      it('should contain a prototype of each component', function () {
        var paletteComponents = Palette.model().get('components'),
          catalogComponents = Catalog();
        expect(paletteComponents.count()).toBe(catalogComponents.length);
      });
    });
  });
});