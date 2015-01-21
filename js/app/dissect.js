/* global define */

var dissect;
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
    return root.state(
      fn(root.state())
    );
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

  filter = function (key, fn) {
    return function (parent) {
      var value = parent.get(key);
      value = value.filter(fn);
      return parent.set(key, value);
    };
  };

  where = function (conditionFn, fn) {
    return function (element) {
      if (conditionFn(element)) {
        element = fn(element);
      }
      return element;
    };
  };

  return {
    dissect: dissect,
    update: update,
    updateAll: updateAll,
    filter: filter,
    where: where
  };

});