/* global require, define */

define(['immutable.min', 'immutable.cursor'], function (Immutable, Cursor) {

  var mixin = function (source, destination) {
    Object.keys(source).forEach(function (key) {
      destination[key] = source[key];
    });
  };

  var is = function (source, reference) {
    var is = true;
    Object.keys(reference).forEach(function (key) {
      if (source[key] === undefined) {
        is = false;
      }
    });
    return is;
  };

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

  Immutable.Seq.prototype.objectify =
    Immutable.Map.prototype.objectify = function () {
      var model = this;
      var proto = this.get('proto');
      if (!proto) {
        throw new Error('Attempted objectify an invalid model.');
      }
      var object = proto(model);
      return object;
  };

  return {

    mixin: mixin,

    is: is
  };
});