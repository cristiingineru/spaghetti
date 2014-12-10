/* global requirejs,SVG,React,document  */

requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    app: '../app'
  }
});

requirejs(['react'], function (React) {

  var text = React.createElement('a', null, 'text');
  React.render(text, document.getElementById('cookerPlaceholder'));

});