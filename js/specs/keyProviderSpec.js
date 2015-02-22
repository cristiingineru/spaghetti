/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine */


define(['app/keyProvider'], function (KeyProvider) {
  describe('KeyProvider', function () {
    it('should return a different key for each call', function () {
      expect(KeyProvider()).not.toBe(KeyProvider());
    });
  });
});