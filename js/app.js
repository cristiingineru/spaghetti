/* global requirejs,SVG,React,document,a  */

requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    React: '../node_modules/react/dist/react-with-addons',
    app: '../app'
  },
  waitSeconds: 15
});

requirejs(['React', 'app/component-catalog', 'app/state', 'app/diagram', 'app/keyProvider', 'app/layoutManager'],
  function (React, Catalog, State, Diagram, KeyProvider, LayoutManager) {

    var resistor = Catalog('resistor');

    var myResistorModel = resistor.model().cursor().objectify()
      .setXY(50, 50)
      .keyify(KeyProvider)
      .deref();

    var mySecondResistorModel = resistor.model().cursor().objectify()
      .setXY(100, 100)
      .keyify(KeyProvider)
      .deref();

    var myTopDiagram = Diagram.model().cursor().objectify()
      .addComponent(myResistorModel)
      .addComponent(mySecondResistorModel)
      .deref();

    State.cursor().withMutations(function (s) {
      s.set('diagram', myTopDiagram);
    });

    var element = React.createElement(Diagram.class(), {
      model: State.cursor().get('diagram')
    });

    React.render(element, document.getElementById('svg'));
  });