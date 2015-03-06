/* global define */

define(['immutable.min', 'immutable.cursor'], function (Immutable, Cursor) {

  // keep it here so the state() or init() functions can work even whithout 'this'
  var theWholeState;

  function Spaghetti() {
    this.init();
  }

  Spaghetti.prototype.init = function () {
    theWholeState = Immutable.fromJS({});
    this.undoCheckpoints = this.undoCheckpoints.clear();
    this.redoCheckpoints = this.redoCheckpoints.clear();
    this.nextCheckpointId = 0;
    this.allCheckpoints = this.allCheckpoints.clear();
    return this;
  };

  Spaghetti.prototype.state = function (newValue) {
    if (newValue !== undefined) {
      theWholeState = newValue;
    }
    return theWholeState;
  };


  Spaghetti.prototype.redraw = function () {};

  Spaghetti.prototype.setRedraw = function (fn) {
    this.redraw = fn;
    return this;
  };
  
  Spaghetti.prototype.checkpointsRedraw = function () {};
  
  Spaghetti.prototype.setCheckpointsRedraw = function (fn) {
    this.checkpointsRedraw = fn;
    return this;
  };

  Spaghetti.prototype.undoCheckpoints = Immutable.Stack();

  Spaghetti.prototype.redoCheckpoints = Immutable.Stack();

  Spaghetti.prototype.nextCheckpointId = 0;
  
  /**
   * All checkpoints ever created. This list is necessary because
   * creating a new checkpoint after an undo operation will empy
   * the redo checkpoints list.
   **/
  Spaghetti.prototype.allCheckpoints = Immutable.OrderedSet();

  Spaghetti.prototype.checkpoint = function (name) {
    var checkpoint = {
      state: theWholeState,
      id: this.nextCheckpointId,
      name: name,
      timestamp: Date.now(),
      previousCheckpointId: this.undoCheckpoints.peek() && this.undoCheckpoints.peek().id
    };
    this.undoCheckpoints = this.undoCheckpoints.push(checkpoint);
    this.allCheckpoints = this.allCheckpoints.add(checkpoint);
    this.redoCheckpoints = this.redoCheckpoints.clear();
    this.nextCheckpointId += 1;
    this.checkpointsRedraw();
    return checkpoint;
  };

  Spaghetti.prototype.checkpoints = function () {
    return this.allCheckpoints;
  };

  Spaghetti.prototype.undo = function () {
    if (this.undoCheckpoints.size > 1) {
      var checkpoint = this.undoCheckpoints.peek();
      this.undoCheckpoints = this.undoCheckpoints.pop();
      this.redoCheckpoints = this.redoCheckpoints.push(checkpoint);

      var currentCheckpoint = this.undoCheckpoints.peek();
      theWholeState = currentCheckpoint.state;
    }
    this.checkpointsRedraw();
  };

  Spaghetti.prototype.redo = function () {
    if (this.redoCheckpoints.size > 0) {
      var checkpoint = this.redoCheckpoints.peek();
      this.redoCheckpoints = this.redoCheckpoints.pop();
      this.undoCheckpoints = this.undoCheckpoints.push(checkpoint);

      var currentCheckpoint = this.undoCheckpoints.peek();
      theWholeState = currentCheckpoint.state;
    }
    this.checkpointsRedraw();
  };
  
  Spaghetti.prototype.currentCheckpoint = function () {
    return this.undoCheckpoints.peek();
  };
  
  Spaghetti.prototype.setUndoRedoStacks = function (undoCheckpoints, redoCheckpoints) {
    this.undoCheckpoints = undoCheckpoints;
    this.redoCheckpoints = redoCheckpoints;
    var currentCheckpoint = this.undoCheckpoints.peek();
    theWholeState = currentCheckpoint.state;
    
    this.checkpointsRedraw();
  };

  return new Spaghetti();
});