/* global requirejs, require, jasmine */

requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    React: '../node_modules/react/dist/react-with-addons',
    Squire: '../node_modules/squirejs/src/Squire',
    app: '../app',
    specs: '../specs',
    mocks: '../specs/mocks'
  },
  waitSeconds: 15
});

require(
  [
    'domReady',
    'specs/spaghettiSpec',
    'specs/dissectSpec',
    'specs/resistorSpec',
    'specs/capacitorSpec',
    'specs/keyProviderSpec',
    'specs/coreSpec',
    'specs/layoutManagerSpec'
  ],
  function (document) {
    jasmine.getEnv().execute();
  }
);