/* global define, require, describe, it, xit, expect, beforeEach, afterEach */


define(['app/spaghetti', 'immutable.min'], function (Spaghetti, Immutable) {
  describe('Spaghetti', function () {

    beforeEach(function () {
      Spaghetti.init();
    });

    afterEach(function () {
      Spaghetti.init();
    });


    it('should be a singleton object', function () {
      var newSpaghetti = require('app/spaghetti');
      expect(newSpaghetti).toBe(Spaghetti);
    });

    describe('Spaghetti.init()', function () {
      it('should allow the reinitialization of the state', function () {
        var value = 'random value';
        Spaghetti.state(value);
        expect(Spaghetti.state()).toBe(value);
        var newSpaghetti = Spaghetti.init();
        expect(newSpaghetti).toBe(Spaghetti);
        expect(Spaghetti.state()).not.toBe(value);
      });
    });

    describe('Spaghetti.state()', function () {
      it('should act as a set or a get function depending on the param presences', function () {
        var value = 'random value';
        expect(Spaghetti.state(value)).toBe(value);
        expect(Spaghetti.state()).toBe(value);
      });
    });
  });
});