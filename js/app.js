/* global requirejs,SVG,React,document,a  */

requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    app: '../app'
  }
});

requirejs(['react', 'app/component-catalog', 'app/state', 'app/diagram'], function (React, Catalog, State, Diagram) {

  var resistor = Catalog('resistor');

  var myResistorModel = resistor.model().cursor().objectify()
    .setX(50)
    .setY(50)
    .deref();

  var myTopDiagram = Diagram.model().cursor().objectify()
    .addComponent(myResistorModel)
    .deref();

  State.cursor().withMutations(function (s) {
    s.set('diagram', myTopDiagram);
  });

  var element = React.createElement(Diagram.class(), {
    model: State.cursor().get('diagram')
  });

  React.render(element, document.getElementById('svg'));
});