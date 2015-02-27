/* global define, require, describe, it, xit, expect, beforeEach, afterEach, jasmine */


define(['app/spaghetti', 'immutable.min'], function (Spaghetti, Immutable) {
  describe('Spaghetti', function () {

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

    it('should create checkpoints with name, id, timestamp and previouse checkpoint', function () {
      var name = 'another name',
        before = Date.now(),
        firstCheckpoint = Spaghetti.checkpoint(),
        secondCheckpoint = Spaghetti.checkpoint(),
        checkpoint = Spaghetti.checkpoint(name),
        after = Date.now();
      expect(checkpoint.name).toBe(name);
      expect(checkpoint.id).toEqual(jasmine.any(Number));
      expect(checkpoint.timestamp - before <= after - before).toBeTruthy();
      expect(checkpoint.previouse).toBe(secondCheckpoint);
      expect(secondCheckpoint.previouse).toBe(firstCheckpoint);
      expect(firstCheckpoint.previous).toBeFalsy();
    });

    it('should return all ever created checkpoints when checkpoints() is called', function () {
      var checkpoints = [],
        checkpointComparer = function (c1, c2) {
          return c1.id - c2.id;
        };

      checkpoints.push(Spaghetti.checkpoint());
      checkpoints.push(Spaghetti.checkpoint());
      Spaghetti.undo();
      checkpoints.push(Spaghetti.checkpoint());
      Spaghetti.undo();

      var spaghettiCheckpoints = Spaghetti.checkpoints();
      expect(checkpoints.length).toBe(spaghettiCheckpoints.length);

      spaghettiCheckpoints = spaghettiCheckpoints.sort(checkpointComparer);
      checkpoints = checkpoints.sort(checkpointComparer);
      checkpoints.forEach(function (c, i) {
        expect(spaghettiCheckpoints.indexOf(c)).toBe(i);
      });
    });

    it('should return the curent checkpoint when curentCheckpoint() is called', function () {
      var state1 = Immutable.fromJS([1]),
        state2 = Immutable.fromJS([2]);
      
      Spaghetti.state(state1);
      var checkpoint1 = Spaghetti.checkpoint('checkpoint 1');
      expect(Spaghetti.curentCheckpoint()).toBe(checkpoint1);
      
      Spaghetti.state(state2);
      var checkpoint2 = Spaghetti.checkpoint('checkpoint 2');
      expect(Spaghetti.curentCheckpoint()).toBe(checkpoint2);
      
      Spaghetti.undo();
      expect(Spaghetti.curentCheckpoint()).toBe(checkpoint1);
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
    
    it('should call the checkpointsRedraw() function everytime checkpoint(), undo() or redo() are called', function () {
      var state1 = Immutable.fromJS([1]),
          checkpointsRedraw = jasmine.createSpy();
      Spaghetti.setCheckpointsRedraw(checkpointsRedraw);
      
      Spaghetti.state(state1);
      Spaghetti.checkpoint('checkpoint 1');
      Spaghetti.undo();
      Spaghetti.redo();

      expect(checkpointsRedraw.calls.count()).toBe(3);
    });
  });
});