/* global define */

define(['immutable.min', 'immutable.cursor'], function (Immutable, Cursor) {

  // keep it here so the state() or init() functions can work even whithout 'this'
  var theWholeState;

  function Spaghetti() {
    this.init();
  }

  Spaghetti.prototype.init = function () {
    theWholeState = Immutable.fromJS({});
    return this;
  };

  Spaghetti.prototype.state = function (newValue) {
    if (newValue !== undefined) {
      theWholeState = newValue;
    }
    return theWholeState;
  };

  Spaghetti.prototype.redraw = function () {};

  Spaghetti.prototype.setRedraw = function (fn) {
    this.redraw = fn;
    return this;
  };

  return new Spaghetti();
});