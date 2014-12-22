/* global define */

define(['immutable.cursor'], function (Cursor) {

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

      cursorify: function (collection, keys) {
        var state = collection;
        return Cursor.from(collection, keys, function (newState, prevState) {
          if (prevState !== state) {
            throw new Error('Attempted to alter an expired cursor.');
          }
          state = newState;
        });
      }

    };
});