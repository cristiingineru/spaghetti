/* global requirejs, require, jasmine */

requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    React: '../node_modules/react/dist/react-with-addons',
    app: '../app',
    specs: '../specs'
  },
  waitSeconds: 15
});

require(
  [
    'domReady',
    'specs/spaghettiSpec',
    'specs/dissectSpec'
  ],
  function (document) {
    jasmine.getEnv().execute();
  }
);