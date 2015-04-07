/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine */


define(['app/palette'], function (Palette) {
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
  });
});