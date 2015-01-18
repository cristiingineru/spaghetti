/* global requirejs, require */

requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    React: '../node_modules/react/dist/react-with-addons',
    jasmine: 'jasmine-2.1.3',
    app: '../app',
    specs: '../specs'
  },
  waitSeconds: 15
});

require(
  [
    'domReady',
    'js/lib/jasmine-2.1.3/jasmine.js',
    'js/lib/jasmine-2.1.3/jasmine-html.js',
    'js/lib/jasmine-2.1.3/boot.js',
    'specs/stateSpec'
  ],
  function (document) {
    /*
    jasmine.getEnv().addReporter(
      new jasmine.HtmlReporter()
    );
    jasmine.getEnv().execute();
    */
  }
);