/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine */


define(['app/checkpointTree', 'Squire', 'immutable.min', 'app/layoutManager', 'React', 'app/part-leg', 'app/part-body', 'mocks/bodyMock'], function (CheckpointTree, Squire, Immutable, LayoutManager, React, Leg, Body, BodyMock) {
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
      checkpoint = function (name) {
        return Immutable.fromJS({
          name: name
        });
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

      var tree = builder(checkpoints, c);

      expect(tree).not.toBeFalsy();
      expect(tree.get('checkpoint')).toBe(c);
      expect(tree.get('children').size).toBe(0);
    });
  });
});