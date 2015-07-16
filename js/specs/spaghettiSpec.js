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
      var spaghetti = new Spaghetti(),
        state1 = Immutable.fromJS([1]),
        state2 = Immutable.fromJS([2]);
      spaghetti.state(state1);
      spaghetti.checkpoint('checkpoint 1');
      spaghetti.state(state2);
      spaghetti.checkpoint('checkpoint 2');

      spaghetti.undo();

      expect(spaghetti.state()).toBe(state1);
    });

    it('should keep the state unchanged if there is nothing to undo', function () {
      var spaghetti = new Spaghetti(),
        state1 = Immutable.fromJS([1]),
        state2 = Immutable.fromJS([2]);
      spaghetti.state(state1);
      spaghetti.checkpoint('checkpoint 1');
      spaghetti.state(state2);
      spaghetti.checkpoint('checkpoint 2');

      spaghetti.undo();
      spaghetti.undo();
      spaghetti.undo();
      spaghetti.undo();

      expect(spaghetti.state()).toBe(state1);
    });

    it('should restore the state to a next checkpoint when redo() is called', function () {
      var spaghetti = new Spaghetti(),
        state1 = Immutable.fromJS([1]),
        state2 = Immutable.fromJS([2]);
      spaghetti.state(state1);
      spaghetti.checkpoint('checkpoint 1');
      spaghetti.state(state2);
      spaghetti.checkpoint('checkpoint 2');

      spaghetti.undo();
      spaghetti.redo();

      expect(spaghetti.state()).toBe(state2);
    });

    it('should keep the state unchanged if there is nothing to redo', function () {
      var spaghetti = new Spaghetti(),
        state1 = Immutable.fromJS([1]),
        state2 = Immutable.fromJS([2]);
      spaghetti.state(state1);
      spaghetti.checkpoint('checkpoint 1');
      spaghetti.state(state2);
      spaghetti.checkpoint('checkpoint 2');

      spaghetti.undo();
      spaghetti.redo();
      spaghetti.redo();
      spaghetti.redo();

      expect(spaghetti.state()).toBe(state2);
    });

    it('should remove the redo checkpoints when state is changed', function () {
      var spaghetti = new Spaghetti(),
        state1 = Immutable.fromJS([1]),
        state2 = Immutable.fromJS([2]),
        state3 = Immutable.fromJS([3]);
      spaghetti.state(state1);
      spaghetti.checkpoint('checkpoint 1');
      spaghetti.state(state2);
      spaghetti.checkpoint('checkpoint 2');

      spaghetti.undo();
      spaghetti.state(state3);
      spaghetti.checkpoint('checkpoint 3');
      spaghetti.redo();

      expect(spaghetti.state()).toBe(state3);
    });

    it('should trigger the checkpoints redraw everytime checkpoint(), undo(), redo() or setUndoRedoStacks() are called', function () {
      var spaghetti = new Spaghetti(),
        c1 = dummyCheckpointWithState(1),
        undoStack = Immutable.Stack.of(c1),
        redoStack = new Immutable.Stack(),
        checkpointsRedraw = jasmine.createSpy();
      spaghetti.setCheckpointsRedraw(checkpointsRedraw);

      spaghetti.checkpoint('checkpoint 1');
      spaghetti.undo();
      spaghetti.redo();
      spaghetti.setUndoRedoStacks(undoStack, redoStack);

      expect(checkpointsRedraw.calls.count()).toBe(4);
    });

    it('should use the specified undo and redo stacks', function () {
      var spaghetti = new Spaghetti(),
        c1 = dummyCheckpointWithState(1),
        c2 = dummyCheckpointWithState(2),
        c3 = dummyCheckpointWithState(3),
        c4 = dummyCheckpointWithState(4),
        c5 = dummyCheckpointWithState(5),
        undoStack = Immutable.Stack.of(c3, c2, c1),
        redoStack = Immutable.Stack.of(c4, c5);

      spaghetti.setUndoRedoStacks(undoStack, redoStack);

      expect(spaghetti.currentCheckpoint()).toBe(c3);
      expect(spaghetti.state()).toBe(3);

      spaghetti.undo();
      expect(spaghetti.currentCheckpoint()).toBe(c2);
      expect(spaghetti.state()).toBe(2);

      spaghetti.redo();
      spaghetti.redo();
      expect(spaghetti.currentCheckpoint()).toBe(c4);
      expect(spaghetti.state()).toBe(4);
    });
  });
});