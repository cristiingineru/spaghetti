/* global define */


define(['immutable', 'immutable.cursor'], function (Immutable, Cursor) {

  var state = Immutable.fromJS({});
  var cursor = Cursor.from(state, function (newState) {
    state = newState;
  });

  return {
    cursor: cursor,
    toString: function() {
      state.toString();
    }
  };
});