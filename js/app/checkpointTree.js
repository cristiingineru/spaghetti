/* global define, dissect, updateAll */


define(['React', 'immutable.min', 'app/checkpointTreeEventHandler', 'app/dissect'], function (React, Immutable, CheckpointTreeEventHandler, Dissect) {

  var node = function (checkpoint, isCurrent) {
      return Immutable.Map()
        .set('checkpoint', checkpoint)
        .set('isCurrent', isCurrent)
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
          var child = node(checkpointChild, false),
            childrenOfChild = childrenOf(child, checkpoints);
          child = child.set('children', childrenOfChild);
          return child;
        });
      return children;
    },
    markCurrentCheckpoint = function (root, currentCheckpoint) {
      if (root.get('checkpoint') === currentCheckpoint) {
        return root.set('isCurrent', true);
      } else {
        root = root.set('isCurrent', false);
      }
      return dissect(root,
        updateAll('children', function (child) {
          return markCurrentCheckpoint(child, currentCheckpoint);
        }));
    },
    field = function (name) {
      return function (item) {
        return item.get(name);
      };
    },
    orReducer = function (reduction, value) {
      return reduction || value;
    },
    markPathToCheckpointCoreResult = function (node, targetFoundUpstream) {
      return Immutable.fromJS({
        node: node,
        targetFoundUpstream: targetFoundUpstream
      });
    },
    markPathToCheckpointCore = function (node, targetCheckpoint) {
      if (node.get('checkpoint') === targetCheckpoint) {
        return markPathToCheckpointCoreResult(node, true);
      }

      var childrenWithMetadata = node.get('children')
        .map(function (child) {
          return markPathToCheckpointCore(child, targetCheckpoint);
        });

      node = node.set('children', childrenWithMetadata.map(field('node')));

      var targetFoundUpstream = childrenWithMetadata
        .map(field('targetFoundUpstream'))
        .reduce(orReducer, false);
      node = node.set('isOnPath', targetFoundUpstream);

      return markPathToCheckpointCoreResult(node, targetFoundUpstream);
    },
    markPathToCheckpoint = function (root, targetCheckpoint) {
      return markPathToCheckpointCore(root, targetCheckpoint)
        .get('node');
    },
    treeBuilder = function (checkpoints, currentCheckpoint) {
      validateTreeBuilderArguments(checkpoints, currentCheckpoint);

      var checkpointWithNoParent = checkpoints.find(isCheckpointRoot),
        root = node(checkpointWithNoParent, false),
        children = childrenOf(root, checkpoints);
      root = root.set('children', children);

      root = markCurrentCheckpoint(root, currentCheckpoint);

      return root;
    };


  var nodeCircleRadius = 4,
    nodeCircleDistance = 20,
    isCurrent = function (node) {
      return node.get('isCurrent');
    },
    renderNode = function (node, x, y, root) {
      var eventHandler = CheckpointTreeEventHandler.checkpointEventHandler(
        node.get('checkpoint'), root, markCurrentCheckpoint);
      return React.createElement('circle', {
        r: nodeCircleRadius,
        cx: x,
        cy: y,
        stroke: '#2f6b7c',
        fill: isCurrent(node) ? '#000' : '#2f6b7c',
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
    member = function (name) {
      return function (object) {
        return object[name];
      };
    },
    sumReducer = function (reduction, value) {
      return reduction + value;
    },
    renderedResult = function (element, width) {
      return {
        element: element,
        width: width
      };
    },
    renderBranch = function (node, x, y, root) {
      var circle = renderNode(node, x, y, root);

      var childBranchesAndWidth = node.get('children')
        .reverse()
        .reduce(function (reduction, child) {
          var branchX = x - reduction.width,
            branchY = y - nodeCircleDistance,
            childBranch = renderBranch(child, branchX, branchY, root),
            line = renderLine(x, y, branchX, branchY),
            element = React.createElement('g', null, [line, childBranch.element]);
          return {
            elements: reduction.elements.concat(element),
            width: reduction.width + childBranch.width
          };
        }, {
          elements: [],
          width: 0
        });

      var childBranches = childBranchesAndWidth.elements;
      var width = childBranchesAndWidth.width;

      return renderedResult(
        React.createElement('g', null, childBranches.concat(circle)),
        Math.max(width, nodeCircleDistance));
    },
    checkpointTreeClass = React.createClass({
      displayName: 'checkpointTree',
      getDefaultProps: function () {
        return {
          root: null
        };
      },
      render: function () {
        return renderBranch(this.props.root, 200, 400, this.props.root).element;
      }
    });


  return {
    name: function () {
      return 'checkpointTree';
    },
    class: function () {
      return checkpointTreeClass;
    },
    treeBuilder: function () {
      return treeBuilder;
    },
    currentCheckpointMarker: function () {
      return markCurrentCheckpoint;
    },
    pathToCheckpointMarker: function () {
      return markPathToCheckpoint;
    }
  };
});