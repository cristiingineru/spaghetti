/* global define */

var dissect;
var select;
var filter;

define(['immutable.min', 'immutable.cursor'], function (Immutable, Cursor) {

  dissect = function (root, fn) {
    if (Immutable.List.isList(root) || Immutable.Seq.isSeq(root) || Immutable.Map.isMap(root)) {
      return fn(root);
    }
    return root.state(
      fn(root.state())
    );
  };

  select = function (key, fn) {
    return function (parent) {
      var value = parent.get(key);
      if (value !== undefined) {
        if (Immutable.List.isList(value) || Immutable.Seq.isSeq(value)) {
          value = value.map(fn);
        } else {
          value = fn(value);
        }
        return parent.set(key, value);
      }
      return parent;
    };
  };

  filter = function (key, fn) {
    return function (parent) {
      var value = parent.get(key);
      value = value.filter(fn);
      return parent.set(key, value);
    };
  };

  return {
    dissect: dissect,
    select: select,
    filter: filter
  };

});