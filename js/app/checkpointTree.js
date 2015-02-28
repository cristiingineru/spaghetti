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

  var timestampAscendingSorter = function (c1, c2) {
    return c1.timestamp - c1.timestamp;
  };

  var renderPath = function (checkpoints, x, y) {
    var elements = [];
    checkpoints.forEach(function (checkpoint, index) {
      var circle = React.createElement('circle', {
        r: checkpointCircleRadius,
        cx: x,
        cy: y - (checkpointCircleDistance * index),
        stroke: '#575555',
        fill: '#575555'
      });
      elements.push(circle);
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

      var mainPathCheckpoints = ancestors(this.props.currentCheckpoint)
        .concat([this.props.currentCheckpoint])
        .sort(timestampAscendingSorter);

      var mainPathElements = renderPath(mainPathCheckpoints, 120, 350);

      return React.createElement('g', null, mainPathElements);
    }
  });


  return {
    class: function () {
      return checkpointTreeClass;
    }
  };
});