/* global define */

define(['immutable.min', 'app/spaghetti'], function (Immutable, Spaghetti) {

  return {
    
    
    checkpointEventHandler: function (checkpoint) {

      return {
        
        onClick: function (event, domID) {
          Spaghetti.state(checkpoint.state);
          Spaghetti.redraw();
        }
        
      };
    }
    
  };
});