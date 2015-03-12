/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine */


define(['app/checkpointTree', 'immutable.min', 'React'], function (CheckpointTree, Immutable, React) {
  describe('CheckpointTree', function () {
    it('should provide a known API', function () {
      expect(typeof (CheckpointTree.name)).toBe('function');
      expect(typeof (CheckpointTree.name())).toBe('string');

      expect(typeof (CheckpointTree.class)).toBe('function');
      expect(CheckpointTree.class).not.toThrow();

      expect(typeof (CheckpointTree.buildTree)).toBe('function');
      expect(typeof (CheckpointTree.markCurrentCheckpoint)).toBe('function');
      expect(typeof (CheckpointTree.markPathToCheckpoint)).toBe('function');
      expect(typeof (CheckpointTree.updateNodes)).toBe('function');
    });
  });

  var nextId = 0,
    id = function () {
      var id = nextId;
      nextId += 1;
      return id;
    },
    dummyCheckpoint = function (name, previous) {
      return {
        name: name,
        id: id(),
        timestamp: Date.now(),
        previousCheckpointId: previous && previous.id
      };
    },
    allNodesInTree = function (root) {
      var sequence = Immutable.Seq.of(root)
        .concat(root.get('children').map(allNodesInTree).flatten(true));
      return sequence;
    };

  describe('buildTree', function () {

    it('should throw if the checkpoint list is empty', function () {
      var c = dummyCheckpoint('c'),
        checkpoints = Immutable.OrderedSet();

      var builderWrapper = function () {
        CheckpointTree.buildTree(checkpoints, c);
      };

      expect(builderWrapper).toThrow();
    });

    it('should throw if the currentCheckpoint is not in the checkpoint list', function () {
      var c1 = dummyCheckpoint('c1'),
        c2 = dummyCheckpoint('c2'),
        checkpoints = Immutable.OrderedSet.of(c1);

      var builderWrapper = function () {
        CheckpointTree.buildTree(checkpoints, c2);
      };

      expect(builderWrapper).toThrow();
    });

    it('should return a single node tree when there is a single checkpoint', function () {
      var c = dummyCheckpoint('c'),
        checkpoints = Immutable.OrderedSet.of(c);

      var root = CheckpointTree.buildTree(checkpoints, c);

      expect(root).not.toBeFalsy();
      expect(root.get('checkpoint')).toBe(c);
      expect(root.get('children').size).toBe(0);
    });

    it('should return a list-like tree when there is no branch', function () {
      var c1 = dummyCheckpoint('c1'),
        c2 = dummyCheckpoint('c2', c1),
        c3 = dummyCheckpoint('c3', c2),
        checkpoints = Immutable.OrderedSet.of(c1, c2, c3);

      var n1 = CheckpointTree.buildTree(checkpoints, c3);
      expect(n1.get('checkpoint')).toBe(c1);
      expect(n1.get('children').size).toBe(1);

      var n2 = n1.get('children').first();
      expect(n2.get('checkpoint')).toBe(c2);
      expect(n2.get('children').size).toBe(1);

      var n3 = n2.get('children').first();
      expect(n3.get('checkpoint')).toBe(c3);
      expect(n3.get('children').size).toBe(0);
    });

    it('should return a node with 3 children when 3 checkpoints have the same parent', function () {
      var p = dummyCheckpoint('parent'),
        c1 = dummyCheckpoint('c1', p),
        c2 = dummyCheckpoint('c2', p),
        c3 = dummyCheckpoint('c3', p),
        checkpoints = Immutable.OrderedSet.of(p, c1, c2, c3);

      var n = CheckpointTree.buildTree(checkpoints, c3);
      expect(n.get('checkpoint')).toBe(p);
      expect(n.get('children').size).toBe(3);
    });

    it('should sort the children by timestamp', function () {

      jasmine.clock().install();
      jasmine.clock().mockDate();
      var p = dummyCheckpoint('parent');
      jasmine.clock().tick(10);
      var c1 = dummyCheckpoint('c1', p);
      jasmine.clock().tick(10);
      var c2 = dummyCheckpoint('c2', p);
      jasmine.clock().tick(10);
      var c3 = dummyCheckpoint('c3', p);
      jasmine.clock().uninstall();

      var checkpoints = Immutable.OrderedSet.of(p, c2, c3, p, c1);

      var n = CheckpointTree.buildTree(checkpoints, c3),
        children = n.get('children'),
        index = 0,
        sortedCheckpointChildren = [c1, c2, c3];
      children.forEach(function (child) {
        expect(child.get('checkpoint')).toBe(sortedCheckpointChildren[index]);
        index += 1;
      });
    });

    it('should mark the node of the current checkpoint accordingly', function () {
      var c1 = dummyCheckpoint('c1'),
        c2 = dummyCheckpoint('c2', c1),
        c3 = dummyCheckpoint('c3', c2),
        checkpoints = Immutable.OrderedSet.of(c1, c2, c3),
        currentCheckpoint = c2,
        checkpointOfNode = function (node) {
          return node.get('checkpoint');
        },
        isCurrent = function (node) {
          return node.get('isCurrent');
        };

      var root = CheckpointTree.buildTree(checkpoints, currentCheckpoint);

      var currentNodes = allNodesInTree(root)
        .filter(isCurrent)
        .map(checkpointOfNode);
      expect(currentNodes.count()).toBe(1);
      expect(currentNodes.first()).toBe(currentCheckpoint);
    });
  });

  describe('pathToCheckpointMarker', function () {

    it('should mark the nodes on the path to a specified checkpoint', function () {
      var c11 = dummyCheckpoint('c11'),
        c21 = dummyCheckpoint('c21', c11),
        c31 = dummyCheckpoint('c31', c21),
        c311 = dummyCheckpoint('c311', c31),
        c32 = dummyCheckpoint('c32', c21),
        c321 = dummyCheckpoint('c321', c32),
        checkpoints = Immutable.Seq.of(c11, c21, c31, c311, c32, c321),
        currentCheckpoint = c21,
        root = CheckpointTree.buildTree(checkpoints, currentCheckpoint);

      var targetCheckpoint = c32;
      root = CheckpointTree.markPathToCheckpoint(root, targetCheckpoint);

      var nodes = allNodesInTree(root),
        nodeWithCheckpoint = function (checkpoint) {
          return function (node) {
            return node.get('checkpoint') === checkpoint;
          };
        },
        isOnPath = function (node) {
          return node.get('isOnPath');
        };
      [c11, c21].forEach(function (checkpoint) {
        var node = nodes.find(nodeWithCheckpoint(checkpoint));
        expect(isOnPath(node)).toBe(true);
      });
      [c31, c311, c32, c321].forEach(function (checkpoint) {
        var node = nodes.find(nodeWithCheckpoint(checkpoint));
        expect(isOnPath(node)).toBeFalsy();
      });
    });
  });

  describe('updateNodes', function () {

    it('should update any checkpoint in a tree', function () {
      var c11 = dummyCheckpoint('c11'),
        c21 = dummyCheckpoint('c21', c11),
        c31 = dummyCheckpoint('c31', c21),
        c311 = dummyCheckpoint('c311', c31),
        c32 = dummyCheckpoint('c32', c21),
        c321 = dummyCheckpoint('c321', c32),
        checkpoints = Immutable.Seq.of(c11, c21, c31, c311, c32, c321),
        currentCheckpoint = c21,
        root = CheckpointTree.buildTree(checkpoints, currentCheckpoint);

      var updater = function (node) {
        return node.set('marked', true);
      };
      root = CheckpointTree.updateNodes(root, updater);

      var nodes = allNodesInTree(root);
      nodes.forEach(function (node) {
        expect(node.get('marked')).toBe(true);
      });
    });
  });
});