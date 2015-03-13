/* global define */

define(['immutable.min', 'app/spaghetti'], function (Immutable, Spaghetti) {

  return {


    checkpointEventHandler: function (checkpoint, tree, markCurrentCheckpoint) {

      var initPath = function (firstNode) {
          return Immutable.OrderedSet.of(firstNode);
        },
        initEmptyPath = function () {
          return Immutable.OrderedSet.of();
        },
        isPath = function (partialPath) {
          return Immutable.OrderedSet.isOrderedSet(partialPath);
        },
        tryAddingToPath = function (path, node) {
          if (path) {
            return path.add(node);
          }
        },
        addToPath = function (path, node) {
          return path.add(node);
        },
        isCurrent = function (node) {
          return node.get('isCurrent');
        },
        nodeToCheckpoint = function (node) {
          return node.get('checkpoint');
        },
        isInUndoOrRedoStack = function (node) {
          return node.get('isInUndoStack') || node.get('isInRedoStack');
        },
        byTimestampDescending = function (c1, c2) {
          return c2.timestamp - c1.timestamp;
        },
        pathToCurrentCheckpoint = function (node) {
          if (isCurrent(node)) {
            return initPath(node);
          }
          var partialPath = node.get('children')
            .map(pathToCurrentCheckpoint)
            .find(isPath);
          return tryAddingToPath(partialPath, node);
        },
        pathFromCurrentCheckpoint = function (node, path, currentCheckpointFound) {
          if (isCurrent(node) || currentCheckpointFound) {
            currentCheckpointFound = true;
            var children = node.get('children'),
              undoOrRedoCheckpoint = children && children.find(isInUndoOrRedoStack),
              newestChild = children && children.sort(byTimestampDescending).last(),
              bestCandidate = undoOrRedoCheckpoint || newestChild;
            if (bestCandidate) {
              path = addToPath(path, bestCandidate);
              path = pathFromCurrentCheckpoint(bestCandidate, path, currentCheckpointFound);
            }
          } else {
            node.get('children').forEach(function (child) {
              path = pathFromCurrentCheckpoint(child, path, currentCheckpointFound);
            });
          }
          return path;
        },
        buildUndoStack = function (node) {
          return pathToCurrentCheckpoint(node)
            .map(nodeToCheckpoint)
            .toStack();
        },
        buildRedoStack = function (node) {
          return pathFromCurrentCheckpoint(node, initEmptyPath(), false)
            .map(nodeToCheckpoint)
            .toStack();
        };

      return {

        onClick: function (event, domID) {
          var newCurrentCheckpoint = checkpoint,
            newTree = markCurrentCheckpoint(tree, newCurrentCheckpoint),
            undoStack = buildUndoStack(newTree),
            redoStack = buildRedoStack(newTree);

          Spaghetti.setUndoRedoStacks(undoStack, redoStack);
          Spaghetti.redraw();
        }

      };
    }

  };
});