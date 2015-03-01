/* global define, require */


define(['React', 'immutable.min', 'app/core', 'app/component-catalog'], function (React, Immutable, Core, Catalog) {

  var checkpointCircleRadius = 3,
    checkpointCircleDistance = 15;

  var ancestors = function (checkpoint) {
    var ancestors = [];
    while (checkpoint.previous) {
      ancestors.push(checkpoint.previous);
      checkpoint = checkpoint.previous;
    }
    return ancestors;
  };
  var directDescendents = function (checkpoint, checkpoints) {
    var directDescendents = checkpoints
      .filter(function (other) {
        return other.previous === checkpoint;
      });
    return directDescendents;
  };

  var timestampAscendingSorter = function (c1, c2) {
    return c1.timestamp - c1.timestamp;
  };
  var timestampDescendingSorter = function (c1, c2) {
    return c1.timestamp - c1.timestamp;
  };

  var olderThan = function (checkpoint) {
    return function (other) {
      return checkpoint !== null ? other.timestamp < checkpoint.timestamp : false;
    };
  };

  var renderCheckpoint = function (checkpoint, x, y) {
    return React.createElement('circle', {
      r: checkpointCircleRadius,
      cx: x,
      cy: y,
      stroke: '#575555',
      fill: '#575555'
    });
  };

  var renderPath = function (pathCheckpoints, x, y) {
    var elements = pathCheckpoints.map(function (checkpoint, index) {
      return renderCheckpoint(checkpoint, x, y - (checkpointCircleDistance * index));
    });
    return elements;
  };

  var checkpointTreeClass = React.createClass({
    displayName: 'checkpointTree',
    getDefaultProps: function () {
      return {
        checkpoints: [],
        currentCheckpoint: null
      };
    },
    render: function () {

      //
      //  Main undo path
      //
      var mainPathCheckpoints = ancestors(this.props.currentCheckpoint)
        .concat([this.props.currentCheckpoint])
        .sort(timestampAscendingSorter);
      var mainPathElements = renderPath(mainPathCheckpoints, 120, 350);

      //
      //  Older (left) branch
      //
      var olderCheckpointsElements = [];
      var checkpoints = this.props.checkpoints;
      var previousMainPathCheckpoint = null;
      mainPathCheckpoints
        .sort(timestampDescendingSorter)
        .forEach(function (mainPathCheckpoint, mainPathCheckpointIndex) {
          var olderDescendentCheckpoints = directDescendents(mainPathCheckpoint, checkpoints)
            .filter(olderThan(previousMainPathCheckpoint))
            .sort(timestampDescendingSorter);
        
          var olderDescendentElements = olderDescendentCheckpoints.map(function (olderDescendentCheckpoint, olderDescendentCheckpointIndex) {
            return renderCheckpoint(olderDescendentCheckpoint,
                                    10,
                                    10);
          });
          olderCheckpointsElements = olderCheckpointsElements.concat(olderDescendentElements);

          previousMainPathCheckpoint = mainPathCheckpoint;
        });

      return React.createElement('g', null, mainPathElements.concat(olderCheckpointsElements));
    }
  });


  return {
    class: function () {
      return checkpointTreeClass;
    }
  };
});