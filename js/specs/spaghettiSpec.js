/* global define, require, describe, it, xit, expect, beforeEach, afterEach, jasmine */


define(['app/spaghetti', 'immutable.min'], function (Spaghetti, Immutable) {
  describe('Spaghetti', function () {

    var dummyCheckpointWithState = function (state) {
      return {
        state: state
      };
    };


    it('should have a constructor', function () {
      var spaghetti = new Spaghetti();

      expect(spaghetti).toBeTruthy();
    });

    it('should have a getter and a setter function for the current state', function () {
      var spaghetti = new Spaghetti(),
        value = 'random value';

      spaghetti.state(value);

      expect(spaghetti.state()).toBe(value);
    });

    it('should return the state when setting it', function () {
      var spaghetti = new Spaghetti(),
        value = 'random value';

      var valueOnSet = spaghetti.state(value);

      expect(valueOnSet).toBe(value);
    });

    it('should create a checkpoint when checkpoint() is called', function () {
      var spaghetti = new Spaghetti();

      var checkpoint = spaghetti.checkpoint();

      expect(checkpoint).not.toBeNull();
      expect(checkpoint.id).toEqual(jasmine.any(Number));
    });

    it('should set a name to each new checkpoint when not providing one', function () {
      var spaghetti = new Spaghetti();

      var checkpoint = spaghetti.checkpoint();

      expect(checkpoint.name).toBeFalsy();
    });

    it('should set the specified name to each new checkpoint', function () {
      var spaghetti = new Spaghetti(),
        name = 'random name';

      var checkpoint = spaghetti.checkpoint(name);

      expect(checkpoint.name).toBe(name);
    });

    it('should set an id to each new checkpoint', function () {
      var spaghetti = new Spaghetti();

      var checkpoint = spaghetti.checkpoint();

      expect(checkpoint.id).toEqual(jasmine.any(Number));
    });

    it('should set a timestamp to each new checkpoint', function () {
      var spaghetti = new Spaghetti();

      var before = Date.now(),
        checkpoint = spaghetti.checkpoint(),
        after = Date.now();

      expect(checkpoint.timestamp - before <= after - before).toBeTruthy();
    });

    it('should set a reference to the previouse checkpoint to each new checkpoint', function () {
      var spaghetti = new Spaghetti(),
        firstCheckpoint = spaghetti.checkpoint();

      var secondCheckpoint = spaghetti.checkpoint();

      expect(secondCheckpoint.previousCheckpointId).toBe(firstCheckpoint.id);
    });

    it('should return all ever created checkpoints when checkpoints() is called', function () {
      var spaghetti = new Spaghetti(),
        checkpoints = Immutable.OrderedSet();

      checkpoints = checkpoints.add(spaghetti.checkpoint());
      checkpoints = checkpoints.add(spaghetti.checkpoint());
      spaghetti.undo();
      checkpoints = checkpoints.add(spaghetti.checkpoint());
      spaghetti.undo();

      var spaghettiCheckpoints = spaghetti.checkpoints();

      expect(spaghettiCheckpoints.equals(checkpoints)).toBe(true);
    });

    it('should return the current checkpoint when currentCheckpoint() is called', function () {
      var spaghetti = new Spaghetti(),
        state = Immutable.fromJS([]);

      spaghetti.state(state);
      var checkpoint = spaghetti.checkpoint();
      expect(spaghetti.currentCheckpoint()).toBe(checkpoint);
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