/* global define */

define(['immutable.min', 'app/spaghetti'], function (Immutable, Spaghetti) {

  return {


    checkpointEventHandler: function (checkpoint, tree, markCurrentCheckpoint) {

      var initPath = function (firstNode) {
          return Immutable.OrderedSet.of(firstNode);
        },
        isPath = function (partialPath) {
          return Immutable.OrderedSet.isOrderedSet(partialPath);
        },
        tryAddingToPath = function (path, node) {
          if (path) {
            return path.add(node);
          }
        },
        nodeToCheckpoint = function (node) {
          return node.get('checkpoint');
        },
        pathToCurrentCheckpoint = function (node) {
          if (node.get('isCurrent')) {
            return initPath(node);
          }
          var partialPath = node.get('children')
            .map(pathToCurrentCheckpoint)
            .find(isPath);
          return tryAddingToPath(partialPath, node);
        },
        buildUndoStack = function (node) {
          return pathToCurrentCheckpoint(node)
            //.reverse()
            .map(nodeToCheckpoint)
            .toStack();
        };

      return {

        onClick: function (event, domID) {
          var newCurrentCheckpoint = checkpoint,
            newTree = markCurrentCheckpoint(tree, newCurrentCheckpoint),
            undoStack = buildUndoStack(newTree),
            redoStack = new Immutable.Stack();

          Spaghetti.setUndoRedoStacks(undoStack, redoStack);
          Spaghetti.redraw();
        }

      };
    }

  };
});