/* global define, require */


define(['React', 'immutable.min', 'app/core', 'app/component-catalog'], function (React, Immutable, Core, Catalog) {

  var checkpointTreeClass = null; //React.createClass({ });


  var node = function (checkpoint) {
    return Immutable.fromJS({
      checkpoint: checkpoint,
      children: []
    });
  };

  var validateTreeBuilderArguments = function (checkpoints, currentCheckpoint) {
    if (checkpoints.size === 0) {
      throw 'The checkpoint list needs to contain at least one checkpoint'
    }
    if (!checkpoints.contains(currentCheckpoint)) {
      throw 'The currentCheckpoin needs to be present in the checkpoints list';
    }
  };

  var treeBuilder = function (checkpoints, currentCheckpoint) {
    validateTreeBuilderArguments(checkpoints, currentCheckpoint);
    var n = node(currentCheckpoint);
    return n;
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