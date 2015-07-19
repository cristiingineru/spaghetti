/* global define, console, dissect, update, updateAll, filter, where */

define(['React', 'redirect_event', 'app/spaghetti', 'app/dissect', 'app/keyProvider'], function (React, redirectEvent, Spaghetti, Dissect, KeyProvider) {


  var ComponentEventHandler = function (component, reactComponent) {

    var componentKey = component.get('key');


    var isDragging = function (component) {
      return component.get('key') === componentKey;
    };


    this.onDragStart = function (event, ui) {
      var originalX,
        originalY;

      dissect(spaghetti.state,
        update('diagram',
          updateAll('components',
            where(isDragging, function (component) {
              originalX = component.get('x');
              originalY = component.get('y');
              return component;
            }))));

      var delta = {
        deltaX: originalX - event.clientX,
        deltaY: originalY - event.clientY
      };
      reactComponent.setState(delta);
    };

    this.onDrag = function (event, ui) {
      var setXY = function (component) {
        return component.objectify()
          .setXY(event.clientX + reactComponent.state.deltaX, event.clientY + reactComponent.state.deltaY)
          .model();
      };

      dissect(spaghetti.state,
        update('diagram',
          updateAll('components',
            where(isDragging, setXY))));

      spaghetti.redraw();
    };

    this.onDragStop = function (event, ui) {

    };

    this.onMouseUp = function (event, ui) {
      spaghetti.checkpoint();
    };
  };



  var BodyEventHandler = function (component) {
    var componentKey = component.get('key'),
      isClicked = function (component) {
        return component.get('key') === componentKey;
      },
      select = function (component) {
        return component.objectify()
          .select(true)
          .model();
      };

    return {
      onClick: function (event, ui) {
        if (event.ctrlKey) {
          dissect(spaghetti.state,
            update('diagram',
              updateAll('components',
                where(isClicked, select))));
        }

        event.stopPropagation();
      }
    };
  };



  var DiagramEventHandler = function () {
    var isNotSelected = function (component) {
      return component.get('selected') !== true;
    };

    return {
      onClick: function (event, ui) {
        if (event.ctrlKey) {
          dissect(spaghetti.state,
            update('diagram',
              filter('components', isNotSelected)));

          spaghetti.redraw();
        }
        event.stopPropagation();
      },

      onKeyPress: function (event, ui) {
        if (event.keyIdentifier === 'U+001A' && event.ctrlKey === true) {
          spaghetti.undo();
          spaghetti.redraw();
        } else if (event.keyIdentifier === 'U+0019' && event.ctrlKey === true) {
          spaghetti.redo();
          spaghetti.redraw();
        }
      }
    };
  };



  var FingerEventHandler = function (finger, leg) {
    var legKey = leg.get('key'),
      unitSize = 14,
      isBreadboard = function (component) {
        return component.get('name') === 'breadboard';
      },
      isDragging = function (leg) {
        return leg.get('key') === legKey;
      },
      isHovered = function (hole) {
        return hole.get('hovered');
      },
      isNear = function (x, y) {
        return function (hole) {
          var x2 = hole.get('x'),
            y2 = hole.get('y'),
            distance = Math.sqrt(Math.pow(x2 - x, 2) + Math.pow(y2 - y, 2)),
            nearDistance = unitSize / 2;
          return distance <= nearDistance;
        };
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
          makeSureIsDisconnected = function (leg) {
            if (leg.get('connected')) {
              leg = leg.objectify()
                .disconnect()
                .model();
            }
            return leg;
          },
          isConnectedToThisLeg = function (hole) {
            return hole.get('connected') && hole.get('legKey') === legKey;
          },
          disconnect = function (hole) {
            return hole.objectify()
              .disconnect()
              .model();
          },
          x = event.clientX,
          y = event.clientY;

        dissect(spaghetti.state,
          update('diagram',
            updateAll('components',
              updateAll('legs',
                where(isDragging, [setX2Y2, makeSureIsDisconnected])))));

        dissect(spaghetti.state,
          update('diagram',
            updateAll('components',
              where(isBreadboard,
                updateAll('strips',
                  updateAll('holes', [
                    where(isHovered, unhover),
                    where(isNear(x, y), hover),
                    where(isConnectedToThisLeg, disconnect)]))))));

        dragging = true;
        spaghetti.redraw();
      },

      onDragStop: function (event, domID) {
        // this function doesn't get called so its content was moved to onMouseUp
      },

      onMouseUp: function (event, domID) {
        var connectToLeg = function (hole) {
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
          holeFound = false,
          holeKey = -1,
          holeX = -1,
          holeY = -1,
          x = event.clientX,
          y = event.clientY;

        dissect(spaghetti.state,
          update('diagram',
            updateAll('components',
              where(isBreadboard,
                updateAll('strips',
                  updateAll('holes', [
                    where(isNear(x, y), [connectToLeg, storeHoleData]),
                    where(isHovered, unhover)]))))));

        if (holeFound) {
          dissect(spaghetti.state,
            update('diagram',
              updateAll('components',
                updateAll('legs',
                  where(isDragging, [snapToHole, connectToHole])))));
        }

        dragging = false;
        spaghetti.checkpoint();
        spaghetti.redraw();
      }

    };
  };



  var PaletteItemEventHandler = function (item, component) {

    return {
      onMouseDown: function (event, ui) {

        var clone = function (component) {
            return component.objectify()
              .keyify(KeyProvider)
              .model();
          },
          isThis = function (componentA) {
            return function (componentB) {
              return componentA.get('key') === componentB.get('key');
            };
          },
          remove = function (key) {
            return function (component) {
              return component.remove('onComponentDidMount');
            };
          };

        var newComponent = clone(component),
          nativeEvent = event.nativeEvent;

        // setting up a post-redraw action for the new component
        newComponent = newComponent.set('onComponentDidMount', function (targetModel, targetDomNode) {

          // post-redraw action
          redirectEvent(nativeEvent, targetDomNode);

          // remove the post-redraw action from the new component
          dissect(spaghetti.state,
            update('diagram',
              updateAll('components',
                where(isThis(newComponent), remove('onComponentDidMount')))));
        });

        dissect(spaghetti.state,
          update('diagram',
            update('components', function (components) {
              return components.push(newComponent);
            })));

        spaghetti.redraw();
      }
    };
  };


  return {
    ComponentEventHandler: ComponentEventHandler,
    BodyEventHandler: BodyEventHandler,
    DiagramEventHandler: DiagramEventHandler,
    FingerEventHandler: FingerEventHandler,
    PaletteItemEventHandler: PaletteItemEventHandler
  };
});