/* global define */

define(['immutable.min', 'immutable.cursor'], function (Immutable, Cursor) {

  var Spaghetti = Object.create(null);

  Spaghetti.theWholeState = Immutable.fromJS({});

  Spaghetti.state = function (newValue) {
    if (newValue !== undefined) {
      this.theWholeState = newValue;
    }
    return this.theWholeState;
  };

  Spaghetti.cursor = function () {
    var onChange = function (newState, prevState) {
      if (prevState !== Spaghetti.theWholeState) {
        throw new Error('Attempted to alter an expired cursor.');
      }
      Spaghetti.theWholeState = newState;
    };
    return Cursor.from(this.theWholeState, onChange);
  };

  Spaghetti.redraw = function () {};

  Spaghetti.setRedraw = function (fn) {
    this.redraw = fn;
  };

  return Spaghetti;
});