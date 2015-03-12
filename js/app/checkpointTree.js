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
    updateNodes = function (root, updater) {
      root = updater(root);
      var children = root.get('children')
        .map(function (child) {
          return updateNodes(child, updater);
        });
      return root.set('children', children);
    },
    buildTree = function (checkpoints, currentCheckpoint) {
      validateTreeBuilderArguments(checkpoints, currentCheckpoint);

      var checkpointWithNoParent = checkpoints.find(isCheckpointRoot),
        root = node(checkpointWithNoParent, false),
        children = childrenOf(root, checkpoints);
      root = root.set('children', children);

      root = markCurrentCheckpoint(root, currentCheckpoint);

      return root;
    },
    markUndoStack = function (root, stack) {
      return updateNodes(root, function (node) {
        if (stack.contains(node.get('checkpoint'))) {
          node = node.set('isInUndoStack', true);
        }
        return node;
      });
    },
    markRedoStack = function (root, stack) {
      return updateNodes(root, function (node) {
        if (stack.contains(node.get('checkpoint'))) {
          node = node.set('isInRedoStack', true);
        }
        return node;
      });
    };


  var nodeCircleRadius = 5,
    nodeCircleDistance = 25,
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
    curvedPath = function (x1, y1, x2, y2) {
      var cx1 = x1,
        cy1 = (y1 + y2) / 2,
        cx2 = x2,
        cy2 = (y1 + y2) / 2,
        start = 'M' + x1.toFixed(2) + ',' + y1.toFixed(2),
        control1 = 'C' + cx1.toFixed(2) + ',' + cy1.toFixed(2),
        control2 = cx2.toFixed(2) + ',' + cy2.toFixed(2),
        end = x2.toFixed(2) + ',' + y2.toFixed(2);
      return start + ' ' + control1 + ' ' + control2 + ' ' + end;
    },
    renderedConnecter = function (x1, y1, x2, y2) {
      return React.createElement('path', {
        d: curvedPath(x1, y1, x2, y2),
        stroke: '#4a9eb5',
        strokeWidth: 1,
        fillOpacity: 0.0
      });
    },
    connectPointsOfInterest = function (x, y, pointsOfInterest) {
      var elements = [];
      pointsOfInterest.forEach(function (point) {
        var line = renderedConnecter(x, y, point.x, point.y);
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
    sortByTimestampAscending = function (collection) {
      return collection.sort(function (n1, n2) {
        return n1.get('checkpoint').timestamp - n2.get('checkpoint').timestamp;
      });
    },
    sortByTimestampDescending = function (collection) {
      return collection.sort(function (n1, n2) {
        return n2.get('checkpoint').timestamp - n1.get('checkpoint').timestamp;
      });
    },
    renderedChildrenAndWidths = function (children, x, y, root, aligner, sorter) {
      var elements = [],
        width = 0,
        pointsOfInterest = [];

      sorter(children).forEach(function (child) {
        var circle = renderNode(child, x, y, root),
          childrenOfChild = child.get('children'),
          defaultWidth = nodeCircleDistance,
          widthOfTheLastSubBranch = defaultWidth;

        if (childrenOfChild.count() > 0) {
          var subBranchX = x,
            subBranchY = y - nodeCircleDistance,
            subBranch = renderedChildrenAndWidths(childrenOfChild, subBranchX, subBranchY, root, aligner, sorter),
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
          middleConnector = renderedConnecter(x, y, middleX, middleY);
        elements = elements.concat(middleConnector, middle.element);
        leftWidth += middle.leftWidth;
        rightWidth += middle.rightWidth;
      }

      if (leftChildren.count()) {
        // The leftX and the leftWidth are treated differently depending whether this is the last special node or not.
        // If this is the last special node then all the left nodes are rendered starting from the middle
        //to make the tree look better.
        var leftX = specialChildIndex !== -1 ? toLeft(x, Math.max(leftWidth, leftWidth + nodeCircleDistance)) : x,
          leftY = y - nodeCircleDistance,
          left = renderedChildrenAndWidths(leftChildren, leftX, leftY, root, toLeft, sortByTimestampDescending),
          leftConnector = connectPointsOfInterest(x, y, left.pointsOfInterest);
        elements = elements.concat(leftConnector, left.element);
        leftWidth += specialChildIndex !== -1 ? left.width : (left.width - nodeCircleDistance);
      }

      if (rightChildren.count()) {
        var rightX = toRight(x, Math.max(rightWidth, rightWidth + nodeCircleDistance)),
          rightY = y - nodeCircleDistance,
          right = renderedChildrenAndWidths(rightChildren, rightX, rightY, root, toRight, sortByTimestampAscending),
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
          currentCheckpoint: null,
          undoStack: new Immutable.Stack(),
          redoStack: new Immutable.Stack()
        };
      },
      render: function () {
        var root = this.props.root,
          currentCheckpoint = this.props.currentCheckpoint,
          currentNode,
          undoStack = this.props.undoStack,
          redoStack = this.props.redoStack;
        root = markPathToCheckpoint(root, currentCheckpoint);
        root = markUndoStack(root, undoStack);
        root = markRedoStack(root, redoStack);
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
    buildTree: buildTree,
    markCurrentCheckpoint: markCurrentCheckpoint,
    markPathToCheckpoint: markPathToCheckpoint,
    updateNodes: updateNodes
  };
});