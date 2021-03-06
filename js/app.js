/* global requirejs, document, dissect, set  */

requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    React: '../node_modules/react/dist/react-with-addons',
    app: '../app'
  },
  waitSeconds: 15
});

requirejs(['React', 'immutable.min', 'app/spaghetti', 'app/dissect', 'app/diagram', 'app/component-breadboard', 'app/palette', 'app/component-resistor', 'app/component-capacitor', 'app/keyProvider', 'app/layoutManager', 'app/classProvider', 'app/checkpointTree', 'app/checkpointTreeEventHandler'],
  function (React, Immutable, Spaghetti, Dissect, Diagram, Breadboard, Palette, Resistor, Capacitor, KeyProvider, LayoutManager, ClassProvider, CheckpointTree, CheckpointTreeEventHandler) {

    var myBreadboardModel = Breadboard.model().objectify()
      .keyify(KeyProvider)
      .setXY(100.5, 250.5)
      .model();
    var myPalette = Palette.model().objectify()
      .keyify(KeyProvider)
      .setXY(150.5, 10.5)
      .model();
    var myTopDiagram = Diagram.model().objectify()
      .addComponent(myBreadboardModel)
      .addComponent(myPalette)
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