/* global requirejs, require, jasmine */

requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    React: '../node_modules/react/dist/react-with-addons',
    Squire: '../node_modules/squirejs/src/Squire',
    //Blanket: '../node_modules/blanket/src/blanket',
    //JasmineBlanket: '../node_modules/blanket/dist/jasmine/blanket_jasmine',
    app: '../app',
    specs: '../specs',
    mocks: '../specs/mocks'
  },
  waitSeconds: 20
});

require(
  [
    'domReady',
    //'Blanket',
    //'JasmineBlanket',
    'specs/spaghettiSpec',
    'specs/dissectSpec',
    'specs/resistorSpec',
    'specs/capacitorSpec',
    'specs/keyProviderSpec',
    'specs/coreSpec',
    'specs/layoutManagerSpec'
  ],
  function (document/*, Blanket, JasmineBlanket*/) {
    // include filter
    //Blanket.options('filter', 'js/');
    
    
    //var jasmineEnv = jasmine.getEnv();
    //jasmineEnv.addReporter(new jasmine.BlanketReporter());
    
    jasmine.getEnv().execute();
  }
);