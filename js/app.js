/* global requirejs,SVG,React,document,a  */

requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    app: '../app'
  }
});

requirejs(['react', 'app/component-catalog', 'app/state'], function (React, Catalog, State) {

  var resistor = Catalog('resistor');

  State.components().withMutations(function (cs) {
    cs.push(resistor.model());
  });

  var element = React.createElement(resistor.class(), {
    model: State.components().get(0)
  });

  React.render(element, document.getElementById('svg'));
});