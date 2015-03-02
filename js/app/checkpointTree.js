/* global define, require */


define(['React', 'immutable.min', 'app/core', 'app/component-catalog'], function (React, Immutable, Core, Catalog) {

  var checkpointTreeClass = null; //React.createClass({ });


  var node = function (checkpoint) {
      return Immutable.Map()
        .set('checkpoint', checkpoint)
        .set('children', Immutable.List());
    },
    validateTreeBuilderArguments = function (checkpoints, currentCheckpoint) {
      if (checkpoints.size === 0) {
        throw 'The checkpoint list needs to contain at least one checkpoint';
      }
      if (!checkpoints.contains(currentCheckpoint)) {
        throw 'The currentCheckpoint needs to be present in the checkpoints list';
      }
    },
    isCheckpointRoot = function (checkpoint) {
      return checkpoint.previousCheckpointId === undefined || checkpoint.previousCheckpointId === null;
    },
    isCheckpointChildOfNode = function (parent) {
      return function (checkpoint) {
        return checkpoint.previousCheckpointId === parent.get('checkpoint').id;
      };
    },
    byTimestampSorter = function (c1, c2) {
      return c1.timestamp - c2.timestamp;
    },
    childrenOf = function (parent, checkpoints) {
      var children = checkpoints
        .filter(isCheckpointChildOfNode(parent))
        .sort(byTimestampSorter)
        .map(function (checkpointChild) {
          var child = node(checkpointChild),
            childrenOfChild = childrenOf(child, checkpoints);
          child = child.set('children', childrenOfChild);
          return child;
        });
      return children;
    };

  var treeBuilder = function (checkpoints, currentCheckpoint) {
    validateTreeBuilderArguments(checkpoints, currentCheckpoint);

    var root = node(checkpoints.find(isCheckpointRoot)),
      children = childrenOf(root, checkpoints);
    root = root.set('children', children);

    return root;
  };


  return {
    name: function () {
      return 'checkpointTree';
    },
    class: function () {
      return checkpointTreeClass;
    },
    treeBuilder: function () {
      return treeBuilder;
    }
  };
});