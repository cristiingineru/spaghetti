/* global define, console, dissect, select, filter */

define(['React', 'react.draggable', 'immutable.min', 'app/state', 'app/dissect', 'app/diagram'], function (React, Draggable, Immutable, State, Dissect, Diagram) {

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

  return {
    componentEventHandler: function (model) {
      var key = model.get('key');
      return {
        onDragStart: function (event, ui) {
          //console.log('*** START ***');
        },
        onDrag: function (event, ui) {
          //console.log('*** DRAG ***');
          var target = getTarget(key);
          var newValue = target.value.deref().cursor().objectify()
            .setXY(event.clientX, event.clientY)
            .model();
          target.replace(newValue);
          redraw();
        },
        onDragStop: function (event, ui) {
          //console.log('*** STOP ***');
          redraw();
        }
      };
    },
    diagramEventHandler: function (model) {
      var key = model.get('key');
      return {
        onBodyClickHandler: function (event, ui) {
          if (event.ctrlKey) {
            dissect(State,
              select('diagram',
                select('components', function (component) {
                  if (component.get('key') === key) {
                    component = component.cursor().objectify()
                      .select(true)
                      .model().deref();
                  }
                  return component;
                })
              )
            );
          }
          event.stopPropagation();
        },
        onDiagramClickHandler: function (event, ui) {
          if (event.ctrlKey) {
            dissect(State,
              select('diagram',
                filter('components', function (component) {
                  return component.get('selected') !== true;
                })
              )
            );
            redraw();
          }
          event.stopPropagation();
        }
      };
    },
    fingerEventHandler: function (model) {
      var key = model.get('key');
      return {
        onDragStart: function (event, domID) {

        },
        onDrag: function (event, domID) {
          dissect(State,
            select('diagram',
              select('components',
                select('legs',
                  select('finger', function (finger) {
                    if (finger.get('key') === key) {
                      finger = finger.cursor().objectify()
                        .setXY(event.clientX, event.clientY)
                        .model().deref();
                    }
                    return finger;
                  })
                )
              )
            )
          );
          redraw();
        },
        onDragEnd: function (event, domID) {

        }
      };
    }
  };

});