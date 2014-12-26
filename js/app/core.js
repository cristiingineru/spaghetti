/* global define */

define(['immutable.min', 'immutable.cursor'], function (Immutable, Cursor) {

  var x = Immutable.fromJS({});
  
  Immutable.List.prototype.cursor = 
  Immutable.Map.prototype.cursor = function () {
    var state = this;
    var cursor = Cursor.from(state, function (newState, prevState) {
      if (prevState !== state) {
        throw new Error('Attempted to alter an expired cursor.');
      }
      state = newState;
    });

    return cursor;
  };

  Immutable.List.prototype.asObject = 
  Immutable.Map.prototype.asObject = function () {
    
  };

  return {

    mixin: function (source, destination) {
      Object.keys(source).forEach(function (key) {
        destination[key] = source[key];
      });
    },

    is: function (source, reference) {
      var is = true;
      Object.keys(reference).forEach(function (key) {
        if (source[key] === undefined) {
          is = false;
        }
      });
      return is;
    },

    _d_cursorify: function (collection) {
      var state = collection;
      var cursor = Cursor.from(collection, function (newState, prevState) {
        if (prevState !== state) {
          throw new Error('Attempted to alter an expired cursor.');
        }
        state = newState;
      });

      // TODO add optimization and freshness pattern
      return {
        cursor: function (keys) {
          return cursor;
        }
      };
    }
  };
});