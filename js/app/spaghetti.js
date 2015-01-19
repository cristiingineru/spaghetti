/* global define */

define(['app/state'], function (State) {

  var Spaghetti = Object.create(null);

  Spaghetti.init = function () {
    this.theOnlyState = State;
    this.theOnlyState.cursor().withMutations(function (st) {
      st.clear()
        .set('diagram', {
          components: []
        });
    });
    return this;
  };

  Spaghetti.state = function () {
    return this.theOnlyState.cursor();
  };

  return Spaghetti;
});