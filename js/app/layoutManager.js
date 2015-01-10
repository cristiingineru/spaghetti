/* global define, console, dissect, select, filter */

define(['React', 'react.draggable', 'immutable.min', 'app/state', 'app/dissect', 'app/diagram'], function (React, Draggable, Immutable, State, Dissect, Diagram) {

  var redraw = function () {
    var element = React.createElement(Diagram.class(), {
      model: State.state().get('diagram')
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
          dissect(State,
            select('diagram',
              select('components', function (component) {
                if (component.get('key') === key) {
                  component = component.objectify()
                    .setXY(event.clientX, event.clientY)
                    .model();
                }
                return component;
              })
            )
          );
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
                    component = component.objectify()
                      .select(true)
                      .model();
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
                      finger = finger.objectify()
                        .setXY(event.clientX, event.clientY)
                        .model();
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