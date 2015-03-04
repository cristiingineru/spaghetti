/* global define */


define(['React', 'immutable.min', 'app/checkpointTreeEventHandler'], function (React, Immutable, CheckpointTreeEventHandler) {

  var nodeCircleRadius = 4,
    nodeCircleDistance = 20,
    renderNode = function (node, x, y) {
      var eventHandler = CheckpointTreeEventHandler.checkpointEventHandler(node.get('checkpoint'));
      return React.createElement('circle', {
        r: nodeCircleRadius,
        cx: x,
        cy: y,
        stroke: '#2f6b7c',
        fill: '#2f6b7c',
        onClick: eventHandler.onClick
      });
    },
    renderLine = function (x1, y1, x2, y2) {
      return React.createElement('line', {
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
        strokeWidth: '2',
        stroke: '#4a9eb5',
        fill: '#4a9eb5'
      });
    },
    renderBranch = function (node, x, y) {
      var circle = renderNode(node, x, y);

      var leftWidth = 0,
        childBranches = node.get('children')
        .reverse()
        .map(function (child) {
          var branchX = x - leftWidth,
            branchY = y - nodeCircleDistance,
            childBranch = renderBranch(child, branchX, branchY),
            line = renderLine(x, y, branchX, branchY);
          leftWidth += childBranch.width;
          return React.createElement('g', null, [line, childBranch.element]);
        })
        .toArray();

      return {
        element: React.createElement('g', null, childBranches.concat([circle])),
        width: Math.max(leftWidth, nodeCircleDistance)
      };
    },
    checkpointTreeClass = React.createClass({
      displayName: 'checkpointTree',
      getDefaultProps: function () {
        return {
          root: null
        };
      },
      render: function () {
        return renderBranch(this.props.root, 200, 400).element;
      }
    });


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
    byTimestampAscending = function (c1, c2) {
      return c1.timestamp - c2.timestamp;
    },
    childrenOf = function (parent, checkpoints) {
      var children = checkpoints
        .filter(isCheckpointChildOfNode(parent))
        .sort(byTimestampAscending)
        .map(function (checkpointChild) {
          var child = node(checkpointChild),
            childrenOfChild = childrenOf(child, checkpoints);
          child = child.set('children', childrenOfChild);
          return child;
        });
      return children;
    },
    treeBuilder = function (checkpoints, currentCheckpoint) {
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