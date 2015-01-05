/* global define, console */

define(['React', 'react.draggable', 'immutable.min', 'app/state', 'app/diagram'], function (React, Draggable, Immutable, State, Diagram) {

  var getTarget = function (key) {
    var diagram = State.cursor().get('diagram');
    var components = diagram.getIn(['components']);
    for (var i = 0; i < components.count(); i++) {
      var component = components.getIn([i]);
      if (component.get('key') === key) {
        return {
          value: component,
          replace: function (newValue) {
            components.set(i, newValue.deref());
          }
        };
      }
    }
    throw new Error('Attempted to use an invalid key.');
  };

  var redraw = function () {
    var element = React.createElement(Diagram.class(), {
      model: State.cursor().get('diagram')
    });
    React.render(element, document.getElementById('svg'));
  };

  return {
    reactDraggableAdapter: function (model) {
      var key = model.get('key');
      return {
        handleStart: function (event, ui) {
          //console.log('*** START ***');
        },
        handleDrag: function (event, ui) {
          //console.log('*** DRAG ***');
          var target = getTarget(key);
          var newValue = target.value.deref().cursor().objectify()
            .setXY(event.clientX, event.clientY);
          target.replace(newValue);
          redraw();
        },
        handleStop: function (event, ui) {
          //console.log('*** STOP ***');
          redraw();
        }
      };
    }
  };

});