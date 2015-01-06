/* global define */


define(['immutable.min', 'immutable.cursor'], function (Immutable, Cursor) {

  var state = Immutable.fromJS({});
  var expiredCursor = false;

  var onChange = function (newState, prevState) {
    if (prevState !== state) {
      throw new Error('Attempted to alter an expired cursor.');
    }
    state = newState;
    cursor = Cursor.from(newState, onChange);
    // the user has to ask for the new cursor
    expiredCursor = true;
  };
  var cursor = Cursor.from(state, onChange);

  var cursorFor = function (keys) {
    return cursor.cursor(keys);
  };

  return {
    cursor: function () {
      expiredCursor = false;
      return cursorFor([]);
    },
    toString: function () {
      return state.toString();
    },
    expiredCursor: function () {
      return expiredCursor;
    }
  };
});