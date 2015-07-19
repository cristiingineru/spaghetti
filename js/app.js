/* global requirejs, document, dissect, set  */

requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    React: '../node_modules/react/dist/react-with-addons',
    app: '../app'
  },
  waitSeconds: 15
});

requirejs(['React', 'immutable.min', 'app/spaghetti', 'app/dissect', 'app/diagram', 'app/component-breadboard', 'app/palette', 'app/component-resistor', 'app/component-capacitor', 'app/keyProvider', 'app/layoutManager', 'app/classProvider', 'app/checkpointTree', 'app/checkpointTreeEventHandlers'],
  function (React, Immutable, Spaghetti, Dissect, Diagram, Breadboard, Palette, Resistor, Capacitor, KeyProvider, LayoutManager, ClassProvider, CheckpointTree, CheckpointTreeEventHandlers) {

    spaghetti = new Spaghetti();

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
    dissect(spaghetti.state,
      set('diagram', myTopDiagram));
    spaghetti.checkpoint();

    var eventHandler = LayoutManager.diagramEventHandler(myTopDiagram);
    document.addEventListener('keypress', eventHandler.onKeyPress);

    var redraw = function () {
      var element = React.createElement(Diagram.class(), {
        model: spaghetti.state().get('diagram')
      });
      React.render(element, document.getElementById('mainDiagramSvg'));
    };
    spaghetti.setRedraw(redraw);
    spaghetti.redraw();

    var checkpointTreeSvgHandler = new CheckpointTreeEventHandlers.SvgEventHandler(document.getElementById('checkpointTreeSvg'));

    var checkpointsRedraw = function () {
      var element = React.createElement(CheckpointTree.class(), {
        root: CheckpointTree.buildTree(spaghetti.checkpoints(), spaghetti.currentCheckpoint()),
        currentCheckpoint: spaghetti.currentCheckpoint(),
        undoStack: spaghetti.undoCheckpoints(),
        redoStack: spaghetti.redoCheckpoints(),
        rootX: 200.5 + checkpointTreeSvgHandler.deltaX(),
        rootY: 400 + checkpointTreeSvgHandler.deltaY()
      });
      React.render(element, document.getElementById('checkpointTreeSvg'));
    };
    checkpointTreeSvgHandler.setCheckpointsRedraw(checkpointsRedraw);
    spaghetti.setCheckpointsRedraw(checkpointsRedraw);
    spaghetti.checkpointsRedraw();

  });