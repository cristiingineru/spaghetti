/* global define */

var spaghetti;

define(['immutable.min', 'immutable.cursor'], function (Immutable, Cursor) {

  var noOp = function () {};

  function Spaghetti() {

    var theState = Immutable.fromJS({}),
      undoCheckpoints = Immutable.Stack(),
      redoCheckpoints = Immutable.Stack(),
      nextCheckpointId = 0,
      redraw = noOp,
      checkpointsRedraw = noOp;

    /**
     * All checkpoints ever created. This list is necessary because
     * creating a new checkpoint after an undo operation will empy
     * the redo checkpoints list.
     **/
    var checkpoints = Immutable.OrderedSet();


    this.redraw = function () {
      return redraw();
    };

    this.checkpointsRedraw = function () {
      return checkpointsRedraw();
    };

    this.state = function (newState) {
      if (newState !== undefined) {
        theState = newState;
      }
      return theState;
    };

    this.setRedraw = function (fn) {
      redraw = fn;
      return this;
    };

    this.setCheckpointsRedraw = function (fn) {
      checkpointsRedraw = fn;
      return this;
    };

    this.checkpoint = function (name) {
      var checkpoint = {
        state: theState,
        id: nextCheckpointId,
        name: name,
        timestamp: Date.now(),
        previousCheckpointId: undoCheckpoints.peek() && undoCheckpoints.peek().id
      };
      undoCheckpoints = undoCheckpoints.push(checkpoint);
      checkpoints = checkpoints.add(checkpoint);
      redoCheckpoints = redoCheckpoints.clear();
      nextCheckpointId += 1;
      checkpointsRedraw();
      return checkpoint;
    };

    this.checkpoints = function () {
      return checkpoints;
    };

    this.undoCheckpoints = function () {
      return undoCheckpoints;
    };

    this.redoCheckpoints = function () {
      return redoCheckpoints;
    };

    this.undo = function () {
      if (undoCheckpoints.size > 1) {
        var checkpoint = undoCheckpoints.peek();
        undoCheckpoints = undoCheckpoints.pop();
        redoCheckpoints = redoCheckpoints.push(checkpoint);

        var currentCheckpoint = undoCheckpoints.peek();
        theState = currentCheckpoint.state;
      }
      checkpointsRedraw();
      return this;
    };

    this.redo = function () {
      if (redoCheckpoints.size > 0) {
        var checkpoint = redoCheckpoints.peek();
        redoCheckpoints = redoCheckpoints.pop();
        undoCheckpoints = undoCheckpoints.push(checkpoint);

        var currentCheckpoint = undoCheckpoints.peek();
        theState = currentCheckpoint.state;
      }
      checkpointsRedraw();
      return this;
    };

    this.currentCheckpoint = function () {
      return undoCheckpoints.peek();
    };

    this.setUndoRedoStacks = function (undoCheckpointsParam, redoCheckpointsParam) {
      undoCheckpoints = undoCheckpointsParam;
      redoCheckpoints = redoCheckpointsParam;
      var currentCheckpoint = undoCheckpoints.peek();
      theState = currentCheckpoint.state;

      redraw();
      checkpointsRedraw();
      return this;
    };
  }

  spaghetti = new Spaghetti();

  return Spaghetti;
});