/* global requirejs,document  */

requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    React: '../node_modules/react/dist/react-with-addons',
    app: '../app'
  },
  waitSeconds: 15
});

requirejs(['React', 'immutable.min', 'app/component-catalog', 'app/state', 'app/diagram', 'app/keyProvider', 'app/layoutManager'],
  function (React, Immutable, Catalog, State, Diagram, KeyProvider, LayoutManager) {

    var buildInitialState = function (State) {
      State.cursor().withMutations(function (st) {
        st.set('diagram', null)
          .set('selections', Immutable.fromJS([]));
      });
      return State;
    };
    State = buildInitialState(State);

    var breadboard = Catalog('breadboard');
    var myBreadboardModel = breadboard.model().objectify()
      .setXY(50, 200)
      .model();
    var resistor = Catalog('resistor');
    var myResistorModel = resistor.model().objectify()
      .setXY(50, 50)
      .keyify(KeyProvider)
      .model();
    var mySecondResistorModel = resistor.model().objectify()
      .setXY(100, 100)
      .keyify(KeyProvider)
      .model();
    var capacitor = Catalog('capacitor');
    //var myCapacitorModel = capacitor.model().objectify()
    //  .setXY(150, 75)
    //  .keyify(KeyProvider)
    //  .model();
    //var mySecondCapacitorModel = capacitor.model().objectify()
    //  .setXY(200, 125)
    //  .keyify(KeyProvider)
    //  .model();
    var myTopDiagram = Diagram.model().objectify()
      .addComponent(myBreadboardModel)
      .addComponent(myResistorModel)
      .addComponent(mySecondResistorModel)
      //  .addComponent(myCapacitorModel)
      //  .addComponent(mySecondCapacitorModel)
      .model();
    State.cursor().set('diagram', myTopDiagram);

    var redraw = function () {
      var element = React.createElement(Diagram.class(), {
        model: State.state().get('diagram')
      });
      React.render(element, document.getElementById('svg'));
    };
    State.redraw = redraw;
    State.redraw();
  
  });