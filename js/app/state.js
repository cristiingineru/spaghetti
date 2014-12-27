/* global define */


define(['immutable.min', 'immutable.cursor'], function (Immutable, Cursor) {

  var state = Immutable.fromJS({
    components: []
  });

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
    components: function () {
      return cursorFor(['components']);
    },
    toString: function () {
      return state.toString();
    }
  };
});