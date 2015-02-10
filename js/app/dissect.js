/* global define */

var dissect;
var set;
var update;
var updateAll;
var filter;
var where;

define(['immutable.min', 'immutable.cursor'], function (Immutable, Cursor) {

  var callFnOnValue = function (fn, value) {
    return fn(value);
  };

  var callFnsOnValue = function (fns, value) {
    fns.forEach(function (fn) {
      value = fn(value);
    });
    return value;
  };

  var callOnValue = function (fnOrFns, value) {
    if (fnOrFns instanceof Array) {
      return callFnsOnValue(fnOrFns, value);
    }
    return callFnOnValue(fnOrFns, value);
  };

  var callFnOnCollection = function (fn, collection) {
    return collection.map(fn);
  };

  var callFnsOnCollection = function (fns, collection) {
    fns.forEach(function (fn) {
      collection = collection.map(fn);
    });
    return collection;
  };

  var callOnCollection = function (fnOrFns, collection) {
    if (fnOrFns instanceof Array) {
      return callFnsOnCollection(fnOrFns, collection);
    }
    return callFnOnCollection(fnOrFns, collection);
  };

  dissect = function (root, fn) {
    if (Immutable.List.isList(root) || Immutable.Seq.isSeq(root) || Immutable.Map.isMap(root)) {
      return fn(root);
    }
    var newRoot = fn(root());
    root(newRoot);
    return root;
  };
  
  set = function (key, value) {
    return function (parent) {
      return parent.set(key, value);
    };
  };

  update = function (key, fnOrFns) {
    return function (parent) {
      var value = parent.get(key);
      if (value !== undefined) {
        value = callOnValue(fnOrFns, value);
        return parent.set(key, value);
      }
      return parent;
    };
  };

  updateAll = function (key, fnOrFns) {
    return function (parent) {
      var value = parent.get(key);
      if (value !== undefined) {
        value = callOnCollection(fnOrFns, value);
        return parent.set(key, value);
      }
      return parent;
    };
  };

  filter = function (key, testFn) {
    return function (parent) {
      var value = parent.get(key);
      value = value.filter(testFn);
      return parent.set(key, value);
    };
  };

  where = function (testFn, fnOrFns) {
    return function (element) {
      if (testFn(element)) {
        element = callOnValue(fnOrFns, element);
      }
      return element;
    };
  };

  return {
    dissect: dissect,
    set: set,
    update: update,
    updateAll: updateAll,
    filter: filter,
    where: where
  };

});