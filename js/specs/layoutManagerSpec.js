/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine */


define(['app/layoutManager'], function (LayoutManager) {
  describe('LayoutManager', function () {
    it('should return component, diagram and finger event handlers', function () {
      expect(LayoutManager.componentEventHandler).not.toBeFalsy();
      expect(LayoutManager.diagramEventHandler).not.toBeFalsy();
      expect(LayoutManager.fingerEventHandler).not.toBeFalsy();
    });
  });
});