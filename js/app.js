/* global requirejs,SVG,React,document,a  */

requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    app: '../app'
  }
});

requirejs(['react', 'app/component-catalog'], function (React, catalog) {

  var component = catalog('resistor');

  var element = React.createElement(component.class, {
    x: 100.5,
    y: 100.5
  });

  React.render(element, document.getElementById('svg'));
});