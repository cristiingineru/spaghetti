/* global requirejs  */

requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    app: '../app'
  }
});

alert('aa');

requirejs([], function() {
});