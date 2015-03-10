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
    isOnPath = function (node) {
      return node.get('isOnPath');
    },
    isSpecial = function (node) {
      return isOnPath(node) || isCurrent(node);
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
    renderedLine = function (x1, y1, x2, y2) {
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
    connectPointsOfInterest = function (x, y, pointsOfInterest) {
      var elements = [];
      pointsOfInterest.forEach(function (point) {
        var line = renderedLine(x, y, point.x, point.y);
        elements = elements.concat(line);
      });
      return React.createElement('g', null, elements);
    },
    member = function (name) {
      return function (object) {
        return object[name];
      };
    },
    sumReducer = function (reduction, value) {
      return reduction + value;
    },
    toLeft = function (x, delta) {
      return x - delta;
    },
    toRight = function (x, delta) {
      return x + delta;
    },
    renderedChildrenAndWidths = function (children, x, y, root, aligner) {
      var elements = [],
        width = 0,
        pointsOfInterest = [];

      children.reverse().forEach(function (child) {
        var circle = renderNode(child, x, y, root),
          childrenOfChild = child.get('children'),
          defaultWidth = nodeCircleDistance,
          widthOfTheLastSubBranch = defaultWidth;

        if (childrenOfChild.count() > 0) {
          var subBranchX = x,
            subBranchY = y - nodeCircleDistance,
            subBranch = renderedChildrenAndWidths(childrenOfChild, subBranchX, subBranchY, root, aligner),
            connector = connectPointsOfInterest(x, y, subBranch.pointsOfInterest);
          elements = elements.concat(connector, subBranch.element);
          widthOfTheLastSubBranch = subBranch.width;
          width += subBranch.width;
        }

        elements = elements.concat(circle);
        pointsOfInterest = pointsOfInterest.concat({
          x: x,
          y: y
        });

        x = aligner(x, widthOfTheLastSubBranch);
      });

      return {
        element: React.createElement('g', null, elements),
        width: Math.max(width, nodeCircleDistance),
        pointsOfInterest: pointsOfInterest
      };
    },
    renderedPathToCurrentCheckpoint = function (node, x, y, root) {

      var elements = [],
        leftWidth = 0,
        rightWidth = 0;

      var children = node.get('children').toIndexedSeq(),
        count = children.count(),
        specialChildIndex = children.findIndex(isSpecial),
        specialChild = specialChildIndex !== -1 ? children.get(specialChildIndex) : null,
        leftChildren = specialChildIndex !== -1 ? children.take(specialChildIndex) : children,
        rightChildren = specialChildIndex !== -1 ? children.slice(specialChildIndex + 1, count) : new Immutable.OrderedSet();

      if (specialChild) {
        var middleX = x,
          middleY = y - nodeCircleDistance,
          middle = renderedPathToCurrentCheckpoint(specialChild, middleX, middleY, root),
          middleConnector = renderedLine(x, y, middleX, middleY);
        elements = elements.concat(middleConnector, middle.element);
        leftWidth += middle.leftWidth;
        rightWidth += middle.rightWidth;
      }

      if (leftChildren.count()) {
        var leftX = toLeft(x, Math.max(leftWidth, leftWidth + nodeCircleDistance)),
          leftY = y - nodeCircleDistance,
          left = renderedChildrenAndWidths(leftChildren, leftX, leftY, root, toLeft),
          leftConnector = connectPointsOfInterest(x, y, left.pointsOfInterest);
        elements = elements.concat(leftConnector, left.element);
        leftWidth += left.width;
      }

      if (rightChildren.count()) {
        var rightX = toRight(x, Math.max(rightWidth, rightWidth + nodeCircleDistance)),
          rightY = y - nodeCircleDistance,
          right = renderedChildrenAndWidths(rightChildren, rightX, rightY, root, toRight),
          rightConnector = connectPointsOfInterest(x, y, right.pointsOfInterest);
        elements = elements.concat(rightConnector, right.element);
        rightWidth += right.width;
      }

      var circle = renderNode(node, x, y, root);
      elements = elements.concat(circle);

      return {
        element: React.createElement('g', null, elements),
        leftWidth: leftWidth, //Math.max(leftWidth, nodeCircleDistance),
        rightWidth: rightWidth //Math.max(rightWidth, nodeCircleDistance)
      };
    },
    checkpointTreeClass = React.createClass({
      displayName: 'checkpointTree',
      getDefaultProps: function () {
        return {
          root: null,
          currentCheckpoint: null
        };
      },
      render: function () {
        var root = markPathToCheckpoint(this.props.root, this.props.currentCheckpoint),
          currentNode = root;
        return renderedPathToCurrentCheckpoint(currentNode, 200, 500, root).element;
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