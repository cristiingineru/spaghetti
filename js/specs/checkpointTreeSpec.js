/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine */


define(['app/checkpointTree', 'immutable.min', 'React'], function (CheckpointTree, Immutable, React) {
  describe('CheckpointTree', function () {
    it('should provide a known API', function () {
      expect(typeof (CheckpointTree.name)).toBe('function');
      expect(typeof (CheckpointTree.name())).toBe('string');

      expect(typeof (CheckpointTree.class)).toBe('function');
      expect(CheckpointTree.class).not.toThrow();

      expect(typeof (CheckpointTree.treeBuilder)).toBe('function');
      expect(CheckpointTree.treeBuilder).not.toThrow();
    });
  });

  describe('CheckpointTree class', function () {});

  describe('treeBuilder', function () {
    var builder = CheckpointTree.treeBuilder(),
      nextId = 0,
      id = function () {
        var id = nextId;
        nextId += 1;
        return id;
      },
      checkpoint = function (name, previous) {
        return {
          name: name,
          id: id(),
          previousCheckpointId: previous && previous.id
        };
      };

    it('should throw if the checkpoint list is empty', function () {
      var c = checkpoint('c'),
        checkpoints = Immutable.OrderedSet();

      var builderWrapper = function () {
        builder(checkpoints, c);
      };

      expect(builderWrapper).toThrow();
    });

    it('should throw if the currentCheckpoint is not in the checkpoint list', function () {
      var c1 = checkpoint('c1'),
        c2 = checkpoint('c2'),
        checkpoints = Immutable.OrderedSet.of(c1);

      var builderWrapper = function () {
        builder(checkpoints, c2);
      };

      expect(builderWrapper).toThrow();
    });

    it('should return a single node tree when there is a single checkpoint', function () {
      var c = checkpoint('c'),
        checkpoints = Immutable.OrderedSet.of(c);

      var root = builder(checkpoints, c);

      expect(root).not.toBeFalsy();
      expect(root.get('checkpoint')).toBe(c);
      expect(root.get('children').size).toBe(0);
    });

    it('should return a list-like tree when there is no branch', function () {
      var c1 = checkpoint('c1'),
        c2 = checkpoint('c2', c1),
        c3 = checkpoint('c3', c2),
        checkpoints = Immutable.OrderedSet.of(c1, c2, c3);

      var n1 = builder(checkpoints, c3);
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
      var p = checkpoint('parent'),
        c1 = checkpoint('c1', p),
        c2 = checkpoint('c2', p),
        c3 = checkpoint('c3', p),
        checkpoints = Immutable.OrderedSet.of(p, c1, c2, c3);

      var n = builder(checkpoints, c3);
      expect(n.get('checkpoint')).toBe(p);
      expect(n.get('children').size).toBe(3);
    });
  });
});