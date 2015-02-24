/* global define */

define(['immutable.min', 'immutable.cursor'], function (Immutable, Cursor) {

  // keep it here so the state() or init() functions can work even whithout 'this'
  var theWholeState;

  function Spaghetti() {
    this.init();
  }

  Spaghetti.prototype.init = function () {
    theWholeState = Immutable.fromJS({});
    this.undoCheckpoints = [];
    this.redoCheckpoints = [];
    this.nextCheckpointId = 0;
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

  /**
   * The order of storing the checkpoints in the undo stack is:
   *  [oldest, old, ... new, newest]
   **/
  Spaghetti.prototype.undoCheckpoints = [];

  /**
   * The order of storing the checkpoints in the redo stack is:
   *  [oldest undo, old undo, ... new undo, newest undo]
   **/
  Spaghetti.prototype.redoCheckpoints = [];

  Spaghetti.prototype.nextCheckpointId = 0;

  Spaghetti.prototype.checkpoint = function (name) {
    var checkpoint = {
      state: theWholeState,
      id: this.nextCheckpointId,
      name: name,
      timestamp: Date.now(),
      previouse: this.undoCheckpoints[this.undoCheckpoints.length - 1]
    };
    this.undoCheckpoints.push(checkpoint);
    this.redoCheckpoints = [];
    this.nextCheckpointId += 1;
    return checkpoint;
  };

  Spaghetti.prototype.checkpoints = function () {
    var allCheckpoints = this.undoCheckpoints.concat(this.redoCheckpoints);
    return allCheckpoints;
  };

  Spaghetti.prototype.undo = function () {
    if (this.undoCheckpoints.length > 1) {
      var checkpoint = this.undoCheckpoints.pop();
      this.redoCheckpoints.push(checkpoint);

      var currentCheckpoint = this.undoCheckpoints[this.undoCheckpoints.length - 1];
      theWholeState = currentCheckpoint.state;
    }
  };

  Spaghetti.prototype.redo = function () {
    if (this.redoCheckpoints.length > 0) {
      var checkpoint = this.redoCheckpoints.pop();
      this.undoCheckpoints.push(checkpoint);

      var currentCheckpoint = this.undoCheckpoints[this.undoCheckpoints.length - 1];
      theWholeState = currentCheckpoint.state;
    }
  };

  return new Spaghetti();
});