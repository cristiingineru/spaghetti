/* global define, console */

define(['React', 'react.draggable', 'immutable.min', 'app/state', 'app/diagram'], function (React, Draggable, Immutable, State, Diagram) {

  var getTargetInComponents = function (components, key) {
    for (var i = 0; i < components.count(); i++) {
      var component = components.getIn([i]);
      if (component.get('key') === key) {
        return {
          value: component,
          replace: function (newValue) {
            components.set(i, newValue.deref());
          },
          delete: function () {
            components.delete(i);
          }
        };
      }
    }
    throw new Error('Attempted to use an invalid key.');
  };

  var getTarget = function (key) {
    var diagram = State.cursor().get('diagram');
    var components = diagram.getIn(['components']);
    return getTargetInComponents(components, key);
  };

  var redraw = function () {
    var element = React.createElement(Diagram.class(), {
      model: State.cursor().get('diagram')
    });
    React.render(element, document.getElementById('svg'));
  };

  var topDiagram = function (State) {
    return State.cursor().getIn(['diagram']);
  };

  var components = function (diagram) {
    return diagram.getIn(['components']);
  };

  var allComponents = function () {
    return components(topDiagram(State));
  };

  var forEach = function (items, action) {
    do
    {
      var currentItems = items();
      currentItems.takeWhile(function (value, key) { return !State.expiredCursor(); })
        .forEach(action);
    }
    while (State.expiredCursor());
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
            .setXY(event.clientX, event.clientY)
            .model();
          target.replace(newValue);
          redraw();
        },
        handleStop: function (event, ui) {
          //console.log('*** STOP ***');
          redraw();
        }
      };
    },
    myHandlerAdapter: function (model) {
      var key = model.get('key');
      return {
        onClickHandler: function (event, ui) {
          if (!key) {
            return;
          }
          var newSelections = State.cursor().getIn(['selections']).deref().withMutations(function (s) {
            s.push(key);
          });
          State.cursor().set('selections', newSelections);
        },
        onKeyPressHandler: function (event, ui) {
          var selections = State.cursor().getIn(['selections']).deref();

          for (var i = 0; i < selections.count(); i++) {
            var selection = selections.get(i);
            var components = State.cursor().getIn(['diagram', 'components']);
            getTargetInComponents(components, selection).delete();
          }

          var newSelections = State.cursor().getIn(['selections']).deref().withMutations(function (s) {
            s.clear()
          });
          State.cursor().set('selections', newSelections);
          

          ///
          {
            forEach(allComponents, function (component) {
              if (component.get('x') !== 100) {
                component.objectify().setX(100);
              }
            });
          }
          ///


          redraw();
        }
      };
    }
  };

});