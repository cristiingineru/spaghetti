/* global define */

define(function () {
  
  var lastProvidedKey = 0;

  return function () {
    lastProvidedKey += 1;
    return lastProvidedKey;
  };
});