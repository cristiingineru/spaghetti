/* global define, require, describe, it, xit, expect, beforeEach, afterEach, jasmine */


define(['app/spaghetti', 'immutable.min'], function (Spaghetti, Immutable) {
  describe('Spaghetti', function () {

    var dummyCheckpointWithState = function (state) {
      return {
        state: state
      };
    };

    beforeEach(function () {
      Spaghetti.init();
    });

    afterEach(function () {
      Spaghetti.init();
    });


    it('should be a singleton object', function () {
      var newSpaghetti = require('app/spaghetti');
      expect(newSpaghetti).toBe(Spaghetti);
    });

    it('should reinitialize the state when init() is called', function () {
      var value = 'random value';
      Spaghetti.state(value);
      expect(Spaghetti.state()).toBe(value);
      var newSpaghetti = Spaghetti.init();
      expect(newSpaghetti).toBe(Spaghetti);
      expect(Spaghetti.state()).not.toBe(value);
    });

    it('should have a getter and a setter function for the current state', function () {
      var value = 'random value';
      expect(Spaghetti.state(value)).toBe(value);
      expect(Spaghetti.state()).toBe(value);
    });

    it('should create a checkpoint when checkpoint() is called', function () {
      var checkpoint = Spaghetti.checkpoint();
      expect(checkpoint).not.toBeNull();
      expect(checkpoint.id).toEqual(jasmine.any(Number));
    });

    it('should create a named checkpoint even without a name', function () {
      var checkpoint = Spaghetti.checkpoint();
      expect(checkpoint.name).toBeFalsy();
    });

    it('should create checkpoints with name, id, timestamp and previous checkpoint', function () {
      var name = 'another name',
        before = Date.now(),
        firstCheckpoint = Spaghetti.checkpoint(),
        secondCheckpoint = Spaghetti.checkpoint(),
        checkpoint = Spaghetti.checkpoint(name),
        after = Date.now();
      expect(checkpoint.name).toBe(name);
      expect(checkpoint.id).toEqual(jasmine.any(Number));
      expect(checkpoint.timestamp - before <= after - before).toBeTruthy();
      expect(checkpoint.previousCheckpointId).toBe(secondCheckpoint.id);
      expect(secondCheckpoint.previousCheckpointId).toBe(firstCheckpoint.id);
      expect(firstCheckpoint.previousCheckpointId).toBeFalsy();
    });

    it('should return all ever created checkpoints when checkpoints() is called', function () {
      var checkpoints = Immutable.OrderedSet(),
        checkpointComparer = function (c1, c2) {
          return c1.id - c2.id;
        };

      checkpoints = checkpoints.add(Spaghetti.checkpoint());
      checkpoints = checkpoints.add(Spaghetti.checkpoint());
      Spaghetti.undo();
      checkpoints = checkpoints.add(Spaghetti.checkpoint());
      Spaghetti.undo();

      var spaghettiCheckpoints = Spaghetti.checkpoints();

      expect(checkpoints.size).toBe(spaghettiCheckpoints.size);
      expect(checkpoints.equals(spaghettiCheckpoints)).toBe(true);
    });

    it('should return the current checkpoint when currentCheckpoint() is called', function () {
      var state1 = Immutable.fromJS([1]),
        state2 = Immutable.fromJS([2]);

      Spaghetti.state(state1);
      var checkpoint1 = Spaghetti.checkpoint('checkpoint 1');
      expect(Spaghetti.currentCheckpoint()).toBe(checkpoint1);

      Spaghetti.state(state2);
      var checkpoint2 = Spaghetti.checkpoint('checkpoint 2');
      expect(Spaghetti.currentCheckpoint()).toBe(checkpoint2);

      Spaghetti.undo();
      expect(Spaghetti.currentCheckpoint()).toBe(checkpoint1);
    });

    it('should restore the state to a previous checkpoint when undo() is called', function () {
      var state1 = Immutable.fromJS([1]),
        state2 = Immutable.fromJS([2]);
      Spaghetti.state(state1);
      Spaghetti.checkpoint('checkpoint 1');
      Spaghetti.state(state2);
      Spaghetti.checkpoint('checkpoint 2');

      Spaghetti.undo();

      expect(Spaghetti.state()).toBe(state1);
    });

    it('should keep the state unchanged if there is nothing to undo', function () {
      var state1 = Immutable.fromJS([1]),
        state2 = Immutable.fromJS([2]);
      Spaghetti.state(state1);
      Spaghetti.checkpoint('checkpoint 1');
      Spaghetti.state(state2);
      Spaghetti.checkpoint('checkpoint 2');

      Spaghetti.undo();
      Spaghetti.undo();
      Spaghetti.undo();
      Spaghetti.undo();

      expect(Spaghetti.state()).toBe(state1);
    });

    it('should restore the state to a next checkpoint when redo() is called', function () {
      var state1 = Immutable.fromJS([1]),
        state2 = Immutable.fromJS([2]);
      Spaghetti.state(state1);
      Spaghetti.checkpoint('checkpoint 1');
      Spaghetti.state(state2);
      Spaghetti.checkpoint('checkpoint 2');

      Spaghetti.undo();
      Spaghetti.redo();

      expect(Spaghetti.state()).toBe(state2);
    });

    it('should keep the state unchanged if there is nothing to redo', function () {
      var state1 = Immutable.fromJS([1]),
        state2 = Immutable.fromJS([2]);
      Spaghetti.state(state1);
      Spaghetti.checkpoint('checkpoint 1');
      Spaghetti.state(state2);
      Spaghetti.checkpoint('checkpoint 2');

      Spaghetti.undo();
      Spaghetti.redo();
      Spaghetti.redo();
      Spaghetti.redo();

      expect(Spaghetti.state()).toBe(state2);
    });

    it('should remove the redo checkpoints when state is changed', function () {
      var state1 = Immutable.fromJS([1]),
        state2 = Immutable.fromJS([2]),
        state3 = Immutable.fromJS([3]);
      Spaghetti.state(state1);
      Spaghetti.checkpoint('checkpoint 1');
      Spaghetti.state(state2);
      Spaghetti.checkpoint('checkpoint 2');

      Spaghetti.undo();
      Spaghetti.state(state3);
      Spaghetti.checkpoint('checkpoint 3');
      Spaghetti.redo();

      expect(Spaghetti.state()).toBe(state3);
    });

    it('should trigger the checkpoints redraw everytime checkpoint(), undo(), redo() or setUndoRedoStacks() are called', function () {
      var c1 = dummyCheckpointWithState(1),
          undoStack = Immutable.Stack.of(c1),
          redoStack = new Immutable.Stack(),
        checkpointsRedraw = jasmine.createSpy();
      Spaghetti.setCheckpointsRedraw(checkpointsRedraw);
      
      Spaghetti.checkpoint('checkpoint 1');
      Spaghetti.undo();
      Spaghetti.redo();
      Spaghetti.setUndoRedoStacks(undoStack, redoStack);

      expect(checkpointsRedraw.calls.count()).toBe(4);
    });

    it('should use the specified undo and redo stacks', function () {
      var c1 = dummyCheckpointWithState(1),
        c2 = dummyCheckpointWithState(2),
        c3 = dummyCheckpointWithState(3),
        c4 = dummyCheckpointWithState(4),
        c5 = dummyCheckpointWithState(5),
        undoStack = Immutable.Stack.of(c3, c2, c1),
        redoStack = Immutable.Stack.of(c4, c5);

      Spaghetti.setUndoRedoStacks(undoStack, redoStack);

      expect(Spaghetti.currentCheckpoint()).toBe(c3);
      expect(Spaghetti.state()).toBe(3);
      
      Spaghetti.undo();
      expect(Spaghetti.currentCheckpoint()).toBe(c2);
      expect(Spaghetti.state()).toBe(2);
      
      Spaghetti.redo();
      Spaghetti.redo();
      expect(Spaghetti.currentCheckpoint()).toBe(c4);
      expect(Spaghetti.state()).toBe(4);
    });
  });
});