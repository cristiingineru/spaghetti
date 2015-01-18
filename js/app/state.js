/* global define */


define(['immutable.min', 'immutable.cursor'], function (Immutable, Cursor) {

  var state = Immutable.fromJS({});

  var onChange = function (newState, prevState) {
    if (prevState !== state) {
      throw new Error('Attempted to alter an expired cursor.');
    }
    state = newState;
    cursor = Cursor.from(newState, onChange);
  };
  var cursor = Cursor.from(state, onChange);

  var cursorFor = function (keys) {
    return cursor.cursor(keys);
  };

  return {
    cursor: function () {
      return cursorFor([]);
    },
    update: function (updater) {
      var newState = updater(state);
      state = newState;
      cursor = Cursor.from(state, onChange);
      return state;
    },
    toString: function () {
      return state.toString();
    }
  };
});