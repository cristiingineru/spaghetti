/* global define, console, dissect, select, filter, where */

define(['React', 'react.draggable', 'immutable.min', 'app/state', 'app/dissect', 'app/diagram'], function (React, Draggable, Immutable, State, Dissect, Diagram) {

  var redraw = function () {
    var element = React.createElement(Diagram.class(), {
      model: State.state().get('diagram')
    });
    React.render(element, document.getElementById('svg'));
  };



  return {


    componentEventHandler: function (component) {
      var key = component.get('key');

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



    diagramEventHandler: function (component) {
      var key = component.get('key');
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



    fingerEventHandler: function (finger, leg) {
      var legKey = leg.get('key');

      var isBreadboard = function (component) {
        return component.get('name') === 'breadboard';
      };

      return {

        onDragStart: function (event, domID) {

        },

        onDrag: function (event, domID) {
          var tryToSetX2Y2 = function (leg) {
              if (leg.get('key') === legKey) {
                leg = leg.objectify()
                  .tryToSetX2Y2(event.clientX, event.clientY)
                  .model();
              }
              return leg;
            },
            isClose = function (hole) {
              var x1 = hole.get('x'),
                y1 = hole.get('y'),
                x2 = event.clientX,
                y2 = event.clientY,
                distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)),
                radius = 3;
              return distance <= radius;
            },
            hover = function (hole) {
              return hole.set('hovered', true);
            },
            isHovered = function (hole) {
              return hole.get('hovered');
            },
            unhover = function (hole) {
              return hole.set('hovered', false);
            };

          dissect(State,
            select('diagram',
              select('components',
                select('legs', tryToSetX2Y2)
              )
            )
          );
          dissect(State,
            select('diagram',
              select('components',
                where(isBreadboard,
                  select('holes', [
                    where(isHovered, unhover),
                    where(isClose, hover)])
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