/* global requirejs,SVG,React,document,a  */

requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    app: '../app'
  }
});

requirejs(['react', 'app/component-catalog', 'app/state'], function (React, Catalog, State) {

  var resistor = Catalog('resistor');

  State.components().set(State.components().count(), resistor);

  var x = State.toString();

  var element = React.createElement(resistor.class(), {
    x: 100.5,
    y: 100.5
  });

  React.render(element, document.getElementById('svg'));
});