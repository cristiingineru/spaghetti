/* global requirejs, document, dissect, set  */

requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    React: '../node_modules/react/dist/react-with-addons',
    app: '../app'
  },
  waitSeconds: 15
});

requirejs(['React', 'immutable.min', 'app/component-catalog', 'app/spaghetti', 'app/dissect', 'app/diagram', 'app/keyProvider', 'app/layoutManager'],
  function (React, Immutable, Catalog, Spaghetti, Dissect, Diagram, KeyProvider, LayoutManager) {

    var breadboard = Catalog('breadboard');
    var myBreadboardModel = breadboard.model().objectify()
      .setXY(35, 200)
      .model();
    var resistor = Catalog('resistor');
    var myResistorModel = resistor.model().objectify()
      .setXY(100, 50)
      .keyify(KeyProvider)
      .model();
    var mySecondResistorModel = resistor.model().objectify()
      .setXY(150, 100)
      .keyify(KeyProvider)
      .model();
    var capacitor = Catalog('capacitor');
    var myCapacitorModel = capacitor.model().objectify()
      .setXY(200, 75)
      .keyify(KeyProvider)
      .model();
    var mySecondCapacitorModel = capacitor.model().objectify()
      .setXY(250, 125)
      .keyify(KeyProvider)
      .model();
    var myTopDiagram = Diagram.model().objectify()
      .addComponent(myBreadboardModel)
      .addComponent(myResistorModel)
      .addComponent(mySecondResistorModel)
      .addComponent(myCapacitorModel)
      .addComponent(mySecondCapacitorModel)
      .model();
    //Spaghetti.cursor().set('diagram', myTopDiagram);
    dissect(Spaghetti.state,
      set('diagram', myTopDiagram));

    var redraw = function () {
      var element = React.createElement(Diagram.class(), {
        model: Spaghetti.state().get('diagram')
      });
      React.render(element, document.getElementById('svg'));
    };
    Spaghetti.setRedraw(redraw);
    Spaghetti.redraw();

  });