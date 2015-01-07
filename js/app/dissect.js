/* global define */

var dissect;
var select;
var filter;

define(['immutable.min', 'immutable.cursor'], function (Immutable, Cursor) {

  dissect = function (root, fn) {
    root.state(
      fn(root.state())
    );
  };

  select = function (key, fn) {
    return function (parent) {
      var value = parent.get(key);
      if (Immutable.List.isList(value) || Immutable.Seq.isSeq(value)) {
        value = value.map(fn);
      } else {
        value = fn(value);
      }
      return parent.set(key, value);
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