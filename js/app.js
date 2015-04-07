/* global requirejs, document, dissect, set  */

requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    React: '../node_modules/react/dist/react-with-addons',
    app: '../app'
  },
  waitSeconds: 15
});

requirejs(['React', 'immutable.min', 'app/spaghetti', 'app/dissect', 'app/diagram', 'app/component-breadboard', 'app/component-resistor', 'app/component-capacitor', 'app/keyProvider', 'app/layoutManager', 'app/checkpointTree', 'app/checkpointTreeEventHandler'],
  function (React, Immutable, Spaghetti, Dissect, Diagram, Breadboard, Resistor, Capacitor, KeyProvider, LayoutManager, CheckpointTree, CheckpointTreeEventHandler) {

    var myBreadboardModel = Breadboard.model().objectify()
      .setXY(100.5, 250.5)
      .model();
    var myResistorModel = Resistor.model().objectify()
      .setXY(100.5, 50.5)
      .keyify(KeyProvider)
      .model();
    var mySecondResistorModel = Resistor.model().objectify()
      .setXY(150.5, 100.5)
      .keyify(KeyProvider)
      .model();
    var myCapacitorModel = Capacitor.model().objectify()
      .setXY(200.5, 75.5)
      .keyify(KeyProvider)
      .model();
    var mySecondCapacitorModel = Capacitor.model().objectify()
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