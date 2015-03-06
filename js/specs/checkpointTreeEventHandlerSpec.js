/* global define, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine, set, beforeEach, afterEach */


define(['app/checkpointTreeEventHandler', 'immutable.min', 'Squire', 'app/checkpointTree'], function (CheckpointTreeEventHandler, Immutable, Squire, CheckpointTree) {
  describe('CheckpointTreeEventHandler', function () {
    it('should return a checkpoint event handler', function () {
      expect(CheckpointTreeEventHandler.checkpointEventHandler).not.toBeFalsy();
    });

    describe('checkpoint event handler', function () {
      it('should return a specialized instance with onClick function', function () {
        var checkpoint = {};
        var handler = CheckpointTreeEventHandler.checkpointEventHandler(checkpoint);
        expect(handler.onClick).not.toBeFalsy();
      });

      describe('onClick', function () {
        var newSpaghettiMock = function () {
          // a new mock is created each time to make sure the spies are called for each test
          return {
            setUndoRedoStacks: jasmine.createSpy(),
            redraw: jasmine.createSpy()
          };
        };

        var builder = CheckpointTree.treeBuilder(),
          nextId = 0,
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
          };

        it('should pass to Spaghetti the new undo and the redo stacks accordingly to the new current checkpoint', function (done) {
          new Squire()
            .mock('app/spaghetti', newSpaghettiMock())
            .require(['app/spaghetti', 'app/checkpointTreeEventHandler'], function (Spaghetti2, CheckpointTreeEventHandler2) {
              var c11 = dummyCheckpoint('c11'),
                c21 = dummyCheckpoint('c21', c11),
                c31 = dummyCheckpoint('c31', c21),
                c311 = dummyCheckpoint('c311', c31),
                c32 = dummyCheckpoint('c32', c21),
                c321 = dummyCheckpoint('c321', c32),
                checkpoints = Immutable.Seq.of(c11, c21, c31, c311, c32, c321),
                currentCheckpoint = c31,
                rootNode = CheckpointTree.treeBuilder()(checkpoints, currentCheckpoint),
                toBeTheNewCurrentCheckpoint = c32,
                handler = CheckpointTreeEventHandler2.checkpointEventHandler(
                  toBeTheNewCurrentCheckpoint, rootNode, CheckpointTree.currentCheckpointMarker());

              handler.onClick();

              var calls = Spaghetti2.setUndoRedoStacks.calls,
                args = calls.argsFor(0);
              expect(calls.count()).toBe(1);
              expect(Immutable.Stack.isStack(args[0])).toBe(true);
              expect(args[0].contains(c11)).toBe(true);
              expect(args[0].contains(c21)).toBe(true);
              expect(args[0].contains(c32)).toBe(true);
              expect(args[0].contains(c31)).toBe(false);
              expect(args[0].contains(c311)).toBe(false);
            
              expect(Immutable.Stack.isStack(args[1])).toBe(true);
              expect(args[1].count()).toBe(0);

              done();
            });
        });

        it('should redraw to reflect the new state', function (done) {
          new Squire()
            .mock('app/spaghetti', newSpaghettiMock())
            .require(['app/spaghetti', 'app/checkpointTreeEventHandler'], function (Spaghetti2, CheckpointTreeEventHandler2) {
              var c11 = dummyCheckpoint('c11'),
                c21 = dummyCheckpoint('c21', c11),
                checkpoints = Immutable.Seq.of(c11, c21),
                currentCheckpoint = c21,
                rootNode = CheckpointTree.treeBuilder()(checkpoints, currentCheckpoint),
                toBeTheNewCurrentCheckpoint = c11,
                handler = CheckpointTreeEventHandler2.checkpointEventHandler(
                  toBeTheNewCurrentCheckpoint, rootNode, CheckpointTree.currentCheckpointMarker());

              handler.onClick();

              expect(Spaghetti2.redraw).toHaveBeenCalled();
              done();
            });
        });
      });

    });
  });
});