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

  Immutable.Seq.Keyed.prototype.objectify3 = function () {
    var map = this.toJS();
    var functions = {};
    for (var key in map) {
      var value = map[key];
      if (map.hasOwnProperty(key) && typeof (value) == 'function') {
        var f = value;
        functions[key] = (function (f) {
          return function () {
            var newArguments = [this];
            for (var i = 0; i < arguments.length; i++) {
              newArguments.push(arguments[i]);
            }
            var mutatedObject = f.apply(null, newArguments);
            // decorating the mutated object with functions as well as the initial object
            mixin(functions, mutatedObject);
            return mutatedObject;
          };
        })(f);
      }
    }
    // decorating the current object with functions
    mixin(functions, this);
    return this;
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

  Immutable.Map.prototype.asObject =
    Immutable.Seq.prototype.asObject = function (fn) {
      var object = this.objectify();
      return fn(object).model();
  };

  return {

    mixin: mixin,

    is: is
  };
});