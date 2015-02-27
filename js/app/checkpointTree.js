/* global define, require */


define(['React', 'immutable.min', 'app/core', 'app/component-catalog'], function (React, Immutable, Core, Catalog) {

  var ancestors = function (checkpoints, checkpoint) {};

  var sortAscending = function (checkpoints) {};

  var checkpointTreeClass = React.createClass({
    displayName: 'checkpointTree',
    getDefaultProps: function () {
      return {
        checkpoints: [],
        curentCheckpoint: null
      };
    },
    render: function () {
      var initialToCurentCheckpoints = sortAscending(
        ancestors(this.props.checkpoints, this.props.curentCheckpoint));
    }
  });


  return {
    class: function () {
      return checkpointTreeClass;
    }
  };
});