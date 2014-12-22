/* global define */


define(['immutable.min', 'immutable.cursor'], function (Immutable, Cursor) {

  var state = Immutable.fromJS({
    components: []
  });
  
  var cursorFor = function (keys) {
    return Cursor.from(state, keys, function (newState, prevState) {
      if (prevState !== state) {
        throw new Error('Attempted to alter an expired cursor.');
      }
      state = newState;
    });
  };

  return {
    state: function () {
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