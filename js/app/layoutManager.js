/* global define, console, dissect, update, updateAll, filter, where */

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
            update('diagram',
              updateAll('components', function (component) {
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
              update('diagram',
                updateAll('components', function (component) {
                  if (component.get('key') === key) {
                    component = component.objectify()
                      .update(true)
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
              update('diagram',
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
      var legKey = leg.get('key'),
        isBreadboard = function (component) {
          return component.get('name') === 'breadboard';
        },
        isDragging = function (leg) {
          return leg.get('key') === legKey;
        },
        isHovered = function (hole) {
          return hole.get('hovered');
        },
        hover = function (hole) {
          return hole.set('hovered', true);
        },
        unhover = function (hole) {
          return hole.set('hovered', false);
        },
        dragging = false;

      return {

        onDragStart: function (event, domID) {

        },

        onDrag: function (event, domID) {
          var setX2Y2 = function (leg) {
              return leg.objectify()
                .tryToSetX2Y2(event.clientX, event.clientY)
                .model();
            },
            isNear = function (hole) {
              var x1 = hole.get('x'),
                y1 = hole.get('y'),
                x2 = event.clientX,
                y2 = event.clientY,
                distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)),
                radius = 3;
              return distance <= radius;
            };

          dissect(State,
            update('diagram',
              updateAll('components',
                updateAll('legs',
                  where(isDragging, setX2Y2)
                )
              )
            )
          );
          dissect(State,
            update('diagram',
              updateAll('components',
                where(isBreadboard,
                  updateAll('holes', [
                    where(isHovered, unhover),
                    where(isNear, hover)])
                )
              )
            )
          );
          dragging = true;
          redraw();
        },

        onDragEnd: function (event, domID) {

        },

        onMouseUp: function (event, domID) {
          var isNear = function (hole) {
              var x1 = hole.get('x'),
                y1 = hole.get('y'),
                x2 = event.clientX,
                y2 = event.clientY,
                distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)),
                radius = 3;
              return distance <= radius;
            },
            connectToLeg = function (hole) {
              return hole.objectify()
                .connectTo(legKey)
                .model();
            },
            storeHoleData = function (hole) {
              holeFound = true;
              holeKey = hole.get('key');
              holeX = hole.get('x');
              holeY = hole.get('y');
              return hole;
            },
            isDragging = function (leg) {
              return leg.get('key') === legKey;
            },
            snapToHole = function (leg) {
              return leg.objectify()
                .tryToSetX2Y2(holeX, holeY)
                .model();
            },
            connectToHole = function (leg) {
              return leg.objectify()
                .connectTo(holeKey)
                .model();
            },
            makeSureIsDisconnected = function (leg) {
              if (leg.get('connected')) {
                leg = leg.objectify()
                  .disconnect()
                  .model();
              }
              return leg;
            },
            holeFound = false,
            holeKey = -1,
            holeX = -1,
            holeY = -1;

          dissect(State,
            update('diagram',
              updateAll('components',
                where(isBreadboard,
                  updateAll('holes', [
                    where(isNear, connectToLeg),
                    where(isNear, storeHoleData),
                    where(isHovered, unhover)])
                )
              )
            )
          );
          if (holeFound) {
            dissect(State,
              update('diagram',
                updateAll('components',
                  updateAll('legs', [
                  where(isDragging, snapToHole),
                  where(isDragging, connectToHole)])
                )
              )
            );
          } else {
            dissect(State,
              update('diagram',
                updateAll('components',
                  updateAll('legs',
                    where(isDragging, makeSureIsDisconnected))
                )
              )
            );
          }
          dragging = false;
          redraw();
        }

      };
    }
  };

});