/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine, set, beforeEach, afterEach */


define(['app/layoutManager', 'React', 'immutable.min', 'Squire', 'app/component-resistor', 'app/component-breadboard', 'app/palette', 'app/diagram', 'app/dissect', 'app/spaghetti', 'app/keyProvider'], function (LayoutManager, React, Immutable, Squire, Resistor, Breadboard, Palette, Diagram, Dissect, Spaghetti, KeyProvider) {
  describe('LayoutManager', function () {
    it('should return component, body, diagram, finger and palette item event handlers', function () {
      expect(LayoutManager.componentEventHandler).not.toBeFalsy();
      expect(LayoutManager.bodyEventHandler).not.toBeFalsy();
      expect(LayoutManager.diagramEventHandler).not.toBeFalsy();
      expect(LayoutManager.fingerEventHandler).not.toBeFalsy();
      expect(LayoutManager.paletteItemEventHandler).not.toBeFalsy();
    });

    var isComponent = function (key) {
        return function (component) {
          return component.get('key') === key;
        };
      },
      isPart = function (key) {
        return function (part) {
          return part.get('key') === key;
        };
      },
      isSelected = function (component) {
        return component.get('selected') || false;
      },
      isBreadboard = function (component) {
        return component.get('name') === 'breadboard';
      },
      isHovered = function (hole) {
        return hole.get('hovered') || false;
      },
      setXY = function (x, y) {
        return function (partOrComponent) {
          return partOrComponent.objectify()
            .setXY(x, y)
            .model();
        };
      },
      hover = function (hole) {
        return hole.set('hovered', true);
      },
      uniqueKeyProvider = function (key) {
        return function () {
          return key;
        };
      },
      keyifiedResistor = function () {
        var resistor = Resistor.model().objectify()
          .keyify(KeyProvider)
          .model();
        return resistor;
      },
      keyifiedBreadboard = function () {
        var breadboard = Breadboard.model().objectify()
          .keyify(KeyProvider)
          .model();
        return breadboard;
      },
      keyifiedPalette = function () {
        var palette = Palette.model().objectify()
          .keyify(KeyProvider)
          .model();
        return palette;
      },
      resistorWithKey = function (key) {
        var resistor = Resistor.model().objectify()
          .keyify(uniqueKeyProvider(key))
          .model();
        return resistor;
      },
      diagramWithComponent = function (component) {
        var diagram = Diagram.model().objectify()
          .addComponent(component)
          .model();
        return diagram;
      },
      diagramWithComponents = function (components) {
        var diagramObject = Diagram.model().objectify();
        components.forEach(function (component) {
          diagramObject.addComponent(component);
        });
        return diagramObject.model();
      },
      spaghettiWithDiagram = function (diagram) {
        dissect(Spaghetti.state,
          set('diagram', diagram));
        return Spaghetti;
      };

    beforeEach(function () {
      Spaghetti.init();
    });

    afterEach(function () {
      Spaghetti.init();
    });

    describe('component event handler', function () {
      it('should return a specialized instance with onDragStart, onDrag, onDragEnd and onMouseUp functions', function () {
        var component = Immutable.fromJS({});
        var handler = LayoutManager.componentEventHandler(component);
        expect(handler.onDragStart).not.toBeFalsy();
        expect(handler.onDrag).not.toBeFalsy();
        expect(handler.onDragStop).not.toBeFalsy();
        expect(handler.onMouseUp).not.toBeFalsy();
      });

      describe('onDrag', function () {
        it('should move the component', function () {
          var key = 9999,
            resistor = resistorWithKey(key),
            diagram = diagramWithComponent(resistor),
            Spaghetti = spaghettiWithDiagram(diagram),
            reactResistorMock = {
              state: {
                deltaX: 0,
                deltaY: 0
              },
              setState: function () {}
            };

          var handler = LayoutManager.componentEventHandler(resistor, reactResistorMock),
            event = {
              clientX: 888,
              clientY: 999
            };
          handler.onDrag(event);

          dissect(Spaghetti.state,
            update('diagram',
              updateAll('components',
                where(isComponent(key), function (myResistor) {
                  expect(myResistor.get('x')).toBe(888);
                  expect(myResistor.get('y')).toBe(999);
                  return myResistor;
                }))));
        });
      });

      describe('onMouseUp', function () {
        it('should create a new checkpoint', function (done) {
          var spaghettiMock = {
            dissect: jasmine.createSpy(),
            redraw: jasmine.createSpy(),
            checkpoint: jasmine.createSpy()
          };

          var squire = new Squire()
            .mock('app/spaghetti', spaghettiMock)
            .require(['app/spaghetti', 'app/layoutManager'], function (Spaghetti2, LayoutManager2) {
              var component = keyifiedResistor(),
                handler = LayoutManager2.componentEventHandler(component);

              handler.onMouseUp();

              expect(spaghettiMock.checkpoint).toHaveBeenCalled();
              done();
            });
        });
      });
    });

    describe('body event handler', function () {
      it('should return a specialized instance with onClick function', function () {
        var component = Immutable.fromJS({});
        var handler = LayoutManager.bodyEventHandler(component);
        expect(handler.onClick).not.toBeFalsy();
      });

      it('should select the component when onClick is called and Ctrl is pressed', function () {
        var key = 9999,
          resistor = resistorWithKey(key),
          diagram = diagramWithComponent(resistor),
          Spaghetti = spaghettiWithDiagram(diagram);

        var handler = LayoutManager.bodyEventHandler(resistor),
          event = {
            ctrlKey: true,
            stopPropagation: function () {}
          };
        handler.onClick(event);

        dissect(Spaghetti.state,
          update('diagram',
            updateAll('components',
              where(isComponent(key), function (myResistor) {
                expect(isSelected(myResistor)).toBe(true);
                return myResistor;
              }))));
      });
    });

    describe('diagram event handler', function () {
      it('should return a specialized instance with onClick and onKeyPress function', function () {
        var handler = LayoutManager.diagramEventHandler();
        expect(handler.onClick).not.toBeFalsy();
        expect(handler.onKeyPress).not.toBeFalsy();
      });

      describe('onClick', function () {
        it('should delete the selected components when Ctrl is pressed', function () {
          var key = 9999,
            resistor = resistorWithKey(key).objectify().select(true).model(),
            diagram = diagramWithComponent(resistor),
            Spaghetti = spaghettiWithDiagram(diagram);

          var handler = LayoutManager.diagramEventHandler(resistor),
            event = {
              ctrlKey: true,
              stopPropagation: function () {}
            };
          handler.onClick(event);

          var updater = jasmine.createSpy();
          dissect(Spaghetti.state,
            update('diagram',
              updateAll('components', updater)));
          expect(updater).not.toHaveBeenCalled();
        });
      });

      describe('onKeyPress', function () {

        var TestUtils = React.addons.TestUtils;

        it('should call undo when Ctrl + Z is pressed', function () {
          var resistor = keyifiedResistor(),
            diagram = diagramWithComponent(resistor),
            Spaghetti = spaghettiWithDiagram(diagram);

          dissect(Spaghetti.state,
            update('diagram',
              updateAll('components', setXY(1111, 1111))));
          Spaghetti.checkpoint();

          dissect(Spaghetti.state,
            update('diagram',
              updateAll('components', setXY(9999, 9999))));
          Spaghetti.checkpoint();

          var handler = LayoutManager.diagramEventHandler(diagram),
            event = {
              ctrlKey: true,
              keyIdentifier: 'U+001A'
            };
          handler.onKeyPress(event);

          dissect(Spaghetti.state,
            update('diagram',
              updateAll('components', function (component) {
                expect(component.get('x')).toBe(1111);
                expect(component.get('y')).toBe(1111);
              })));
        });
      });
    });

    describe('finger event handler', function () {
      it('should return a specialized instance with onDragStart, onDrag, onDragEnd and onMouseUp functions', function () {
        var finger = Immutable.fromJS({});
        var leg = Immutable.fromJS({});
        var handler = LayoutManager.fingerEventHandler(finger, leg);
        expect(handler.onDragStart).not.toBeFalsy();
        expect(handler.onDrag).not.toBeFalsy();
        expect(handler.onDragStop).not.toBeFalsy();
        expect(handler.onMouseUp).not.toBeFalsy();
      });

      describe('onDrag', function () {
        it('should move the finger', function () {
          var resistor = keyifiedResistor(),
            diagram = diagramWithComponent(resistor),
            Spaghetti = spaghettiWithDiagram(diagram);

          var leg0 = resistor.getIn(['legs', 0]),
            leg1 = resistor.getIn(['legs', 1]),
            finger0 = leg0.get('finger'),
            finger1 = leg1.get('finger'),
            handler = LayoutManager.fingerEventHandler(finger0, leg0),
            event = {
              clientX: 888,
              clientY: 999
            };
          handler.onDrag(event);

          var finger0Key = finger0.get('key'),
            finger1Key = finger1.get('key');
          dissect(Spaghetti.state,
            update('diagram',
              updateAll('components',
                updateAll('legs',
                  update('finger', [
                  where(isPart(finger0Key), function (finger) {
                      expect(finger.get('x')).toBe(888);
                      expect(finger.get('y')).toBe(999);
                      return finger;
                    }),
                  where(isPart(finger1Key), function (finger) {
                      expect(finger.get('x')).not.toBe(888);
                      expect(finger.get('y')).not.toBe(999);
                      return finger;
                    })])))));
        });

        it('should mark a hole as hovered when the finger is on top of it', function () {
          var resistor = keyifiedResistor(),
            breadboard = keyifiedBreadboard(),
            diagram = diagramWithComponents([resistor, breadboard]),
            Spaghetti = spaghettiWithDiagram(diagram);

          var hole = breadboard.getIn(['strips', 0, 'holes', 0]),
            leg = resistor.getIn(['legs', 0]),
            finger = leg.get('finger'),
            handler = LayoutManager.fingerEventHandler(finger, leg),
            event = {
              clientX: hole.get('x'),
              clientY: hole.get('y')
            };
          handler.onDrag(event);

          var holeKey = hole.get('key');
          dissect(Spaghetti.state,
            update('diagram',
              updateAll('components',
                where(isBreadboard,
                  updateAll('holes',
                    where(isPart(holeKey), function (hole) {
                      expect(hole.get('hovered')).toBe(true);
                      return hole;
                    }))))));
        });

        it('should mark any hovered hole as unhovered when the finger is not on top of it', function () {
          var resistor = keyifiedResistor(),
            breadboard = keyifiedBreadboard(),
            diagram = diagramWithComponents([resistor, breadboard]),
            Spaghetti = spaghettiWithDiagram(diagram);

          // hover all holes
          dissect(Spaghetti.state,
            update('diagram',
              updateAll('components',
                where(isBreadboard,
                  updateAll('holes', hover)))));

          var leg = resistor.getIn(['legs', 0]),
            finger = leg.get('finger'),
            handler = LayoutManager.fingerEventHandler(finger, leg),
            event = {
              // away from all the holes
              clientX: 999999,
              clientY: 999999
            };
          handler.onDrag(event);

          var updater = jasmine.createSpy();
          dissect(Spaghetti.state,
            update('diagram',
              updateAll('components',
                where(isBreadboard,
                  updateAll('holes',
                    where(isHovered, updater))))));
          expect(updater).not.toHaveBeenCalled();
        });

        it('should disconnect the finger and its leg when its connect hole is not near anymore', function () {
          var resistor = keyifiedResistor(),
            breadboard = keyifiedBreadboard(),
            diagram = diagramWithComponents([resistor, breadboard]),
            Spaghetti = spaghettiWithDiagram(diagram);

          var hole = breadboard.getIn(['strips', 0, 'holes', 0]),
            leg = resistor.getIn(['legs', 0]),
            finger = leg.get('finger'),
            handler = LayoutManager.fingerEventHandler(finger, leg),
            event1 = {
              clientX: hole.get('x'),
              clientY: hole.get('y')
            };
          handler.onMouseUp(event1);
          var event2 = {
            // away from all the holes
            clientX: 999999,
            clientY: 999999
          };
          handler.onDrag(event2);

          var holeKey = hole.get('key'),
            legKey = leg.get('key');
          dissect(Spaghetti.state,
            update('diagram',
              updateAll('components', [
                where(isBreadboard,
                  updateAll('holes',
                    where(isPart(holeKey), function (hole) {
                      expect(hole.get('connected')).toBeFalsy();
                      expect(hole.get('legKey')).toBeFalsy();
                      return hole;
                    }))),
                updateAll('legs', [
                  where(isPart(legKey), function (leg) {
                    expect(leg.get('connected')).toBeFalsy();
                    expect(leg.get('holeKey')).toBeFalsy();
                    return leg;
                  }),
                  where(isPart(legKey),
                    update('finger', function (finger) {
                      expect(finger.get('connected')).toBeFalsy();
                      expect(finger.get('holeKey')).toBeFalsy();
                      return finger;
                    }))])])));

          /*
          var holes = select(Spaghetti.state, ['diagram', 'components', 'holes', isTheSame(hole)]);
          expect(holes.count()).toBe(1);
          expect(holes[0].get('connected')).toBeFalsy();
          expect(holes[0].get('legKey')).toBeFalsy();

          var fingers = select(Spaghetti.state, ['diagram', 'components', 'legs', isTheSame(leg), 'finger']);
          expect(fingers.count()).toBe(1);
          expect(fingers[0].get('connected')).toBeFalsy();
          expect(fingers[0].get('holeKey')).toBeFalsy();
          */
        });
      });

      describe('onMouseUp', function () {
        it('should connect the finger, its leg and a hole when they are close', function () {
          var resistor = keyifiedResistor(),
            breadboard = keyifiedBreadboard(),
            diagram = diagramWithComponents([resistor, breadboard]),
            Spaghetti = spaghettiWithDiagram(diagram);

          var hole = breadboard.getIn(['strips', 0, 'holes', 0]),
            leg = resistor.getIn(['legs', 0]),
            finger = leg.get('finger'),
            handler = LayoutManager.fingerEventHandler(finger, leg),
            event = {
              clientX: hole.get('x'),
              clientY: hole.get('y')
            };
          handler.onMouseUp(event);

          var holeKey = hole.get('key'),
            legKey = leg.get('key');
          dissect(Spaghetti.state,
            update('diagram',
              updateAll('components', [
                where(isBreadboard,
                  updateAll('holes',
                    where(isPart(holeKey), function (hole) {
                      expect(hole.get('connected')).toBe(true);
                      expect(hole.get('legKey')).toBe(legKey);
                      return hole;
                    }))),
                updateAll('legs', [
                  where(isPart(legKey), function (leg) {
                    expect(leg.get('connected')).toBe(true);
                    expect(leg.get('holeKey')).toBe(holeKey);
                    return leg;
                  }),
                  where(isPart(legKey),
                    update('finger', function (finger) {
                      expect(finger.get('connected')).toBe(true);
                      expect(finger.get('holeKey')).toBe(holeKey);
                      return finger;
                    }))])])));
        });

        it('should mark any hovered hole as unhovered', function () {
          var resistor = keyifiedResistor(),
            breadboard = keyifiedBreadboard(),
            diagram = diagramWithComponents([resistor, breadboard]),
            Spaghetti = spaghettiWithDiagram(diagram);

          // hover all holes
          dissect(Spaghetti.state,
            update('diagram',
              updateAll('components',
                where(isBreadboard,
                  updateAll('holes', hover)))));

          var leg = resistor.getIn(['legs', 0]),
            finger = leg.get('finger'),
            handler = LayoutManager.fingerEventHandler(finger, leg),
            event = {
              // away from all the holes
              clientX: 999999,
              clientY: 999999
            };
          handler.onMouseUp(event);

          var updater = jasmine.createSpy();
          dissect(Spaghetti.state,
            update('diagram',
              updateAll('components',
                where(isBreadboard,
                  updateAll('holes',
                    where(isHovered, updater))))));
          expect(updater).not.toHaveBeenCalled();
        });

        xit('should snap the finger when connecting it to a hole', function () {});


      });
    });

    describe('palette item event handler', function () {
      it('should return a specialized instance with onMouseDown function', function () {
        var component = Immutable.fromJS({});
        var handler = LayoutManager.paletteItemEventHandler(component);
        expect(handler.onMouseDown).not.toBeFalsy();
      });

      describe('onMouseDown', function () {

        var TestUtils = React.addons.TestUtils;
        var renderSpaghettiState = function (stateAccessor) {
          var diagram = stateAccessor().get('diagram'),
            diagramElement = React.createElement(Diagram.class(), {
              model: diagram
            });
          return TestUtils.renderIntoDocument(diagramElement);
        };

        it('should create a new component', function () {
          var palette = keyifiedPalette(),
            diagram = diagramWithComponent(palette),
            spaghetti = spaghettiWithDiagram(diagram),
            view = renderSpaghettiState(spaghetti.state);

          var items = TestUtils.scryRenderedComponentsWithType(view, Palette.paletteItemClass());
          React.addons.TestUtils.Simulate.mouseDown(items[0].getDOMNode());

          var newDiagram = spaghetti.state().get('diagram'),
            newComponents = newDiagram.get('components');
          expect(newComponents.count()).toBe(2);
        });
      });
    });
  });
});