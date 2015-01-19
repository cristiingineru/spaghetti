/* global define, describe, it, expect */


define(['app/state'], function (State) {
  describe('State', function () {
    
    it('should fail', function () {
      expect(true).toBe(false);
    });
    
    it('should pass', function () {
      expect(true).toBe(true);
    });
  });
});
