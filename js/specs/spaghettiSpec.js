/* global define, require, describe, it, xit, expect, beforeEach, afterEach */


define(['app/spaghetti'], function (/* Spaghetti */) {
  describe('Spaghetti', function () {

    /* Spaghetti will be cleaned up before and after each test make sure there are no side effects */
    var Spaghetti;

    beforeEach(function () {
      Spaghetti = require('app/spaghetti').init();
    });

    afterEach(function () {
      Spaghetti = require('app/spaghetti').init();
    });


    it('should initialize the state with an empty diagram', function () {
      var state = Spaghetti.state();
      expect(state.get('diagram')).not.toBe(null);
      expect(state.getIn(['diagram', 'components'])).not.toBe(null);
    });

    it('should be a singleton object', function () {
      var localSpaghetti = require('app/spaghetti');
      expect(localSpaghetti).toBe(Spaghetti);
    });

    it('should allow the reinitialization of the state', function () {
      Spaghetti.state().set('x', 'value');
      expect(Spaghetti.state().get('x')).toBe('value');
      Spaghetti.init();
      expect(Spaghetti.state().get('x')).toBe(undefined);
    });

    xit('should provide direct read/write access to the entire state', function () {});

    xit('should provide direct read/write access to all the breadboards', function () {});

  });
});