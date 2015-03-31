/* global requirejs, document, dissect, set  */

requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    React: '../node_modules/react/dist/react-with-addons',
    app: '../app'
  },
  waitSeconds: 15
});

requirejs(['React', 'immutable.min', 'app/component-catalog', 'app/spaghetti', 'app/dissect', 'app/diagram', 'app/keyProvider', 'app/layoutManager', 'app/checkpointTree', 'app/checkpointTreeEventHandler'],
  function (React, Immutable, Catalog, Spaghetti, Dissect, Diagram, KeyProvider, LayoutManager, CheckpointTree, CheckpointTreeEventHandler) {

    var breadboard = Catalog('breadboard');
    var myBreadboardModel = breadboard.model().objectify()
      .setXY(100.5, 300.5)
      .model();
    var resistor = Catalog('resistor');
    var myResistorModel = resistor.model().objectify()
      .setXY(100.5, 50.5)
      .keyify(KeyProvider)
      .model();
    var mySecondResistorModel = resistor.model().objectify()
      .setXY(150.5, 100.5)
      .keyify(KeyProvider)
      .model();
    var capacitor = Catalog('capacitor');
    var myCapacitorModel = capacitor.model().objectify()
      .setXY(200.5, 75.5)
      .keyify(KeyProvider)
      .model();
    var mySecondCapacitorModel = capacitor.model().objectify()
      .setXY(250.5, 125.5)
      .keyify(KeyProvider)
      .model();
    var myTopDiagram = Diagram.model().objectify()
      .addComponent(myBreadboardModel)
      .addComponent(myResistorModel)
      .addComponent(mySecondResistorModel)
      .addComponent(myCapacitorModel)
      .addComponent(mySecondCapacitorModel)
      .model();
    dissect(Spaghetti.state,
      set('diagram', myTopDiagram));
    Spaghetti.checkpoint();

    var LayoutManager = require('app/layoutManager');
    var eventHandler = LayoutManager.diagramEventHandler(myTopDiagram);
    document.addEventListener('keypress', eventHandler.onKeyPress);

    var redraw = function () {
      var element = React.createElement(Diagram.class(), {
        model: Spaghetti.state().get('diagram')
      });
      React.render(element, document.getElementById('mainDiagramSvg'));
    };
    Spaghetti.setRedraw(redraw);
    Spaghetti.redraw();

    var checkpointTreeSvgHandler = CheckpointTreeEventHandler.svgEventHandler(document.getElementById('checkpointTreeSvg'));

    var checkpointsRedraw = function () {
      var element = React.createElement(CheckpointTree.class(), {
        root: CheckpointTree.buildTree(Spaghetti.checkpoints(), Spaghetti.currentCheckpoint()),
        currentCheckpoint: Spaghetti.currentCheckpoint(),
        undoStack: Spaghetti.undoCheckpoints,
        redoStack: Spaghetti.redoCheckpoints,
        rootX: 200.5 + checkpointTreeSvgHandler.deltaX(),
        rootY: 400 + checkpointTreeSvgHandler.deltaY()
      });
      React.render(element, document.getElementById('checkpointTreeSvg'));
    };
    checkpointTreeSvgHandler.setCheckpointsRedraw(checkpointsRedraw);
    Spaghetti.setCheckpointsRedraw(checkpointsRedraw);
    Spaghetti.checkpointsRedraw();

  });