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

    var resistor = Catalog('resistor');
    var myResistorModel = resistor.model().cursor().objectify()
      .setXY(50, 50)
      .keyify(KeyProvider)
      .model().deref();
    var mySecondResistorModel = resistor.model().cursor().objectify()
      .setXY(100, 100)
      .keyify(KeyProvider)
      .model().deref();
    var capacitor = Catalog('capacitor');
    var myCapacitorModel = capacitor.model().cursor().objectify()
      .setXY(150, 75)
      .keyify(KeyProvider)
      .model().deref();
    var mySecondCapacitorModel = capacitor.model().cursor().objectify()
      .setXY(200, 125)
      .keyify(KeyProvider)
      .model().deref();
    var myTopDiagram = Diagram.model().cursor().objectify()
      .addComponent(myResistorModel)
      .addComponent(mySecondResistorModel)
      .addComponent(myCapacitorModel)
      .addComponent(mySecondCapacitorModel)
      .model().deref();
    State.cursor().set('diagram', myTopDiagram);

    var element = React.createElement(Diagram.class(), {
      model: State.cursor().get('diagram')
    });
    React.render(element, document.getElementById('svg'));
  });