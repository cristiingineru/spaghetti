/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine, set, beforeEach, afterEach */


define(['app/layoutManager', 'immutable.min', 'Squire', 'app/component-resistor', 'app/diagram', 'app/dissect', 'app/spaghetti'], function (LayoutManager, Immutable, Squire, Resistor, Diagram, Dissect, Spaghetti) {
  describe('LayoutManager', function () {
    it('should return component, body, diagram and finger event handlers', function () {
      expect(LayoutManager.componentEventHandler).not.toBeFalsy();
      expect(LayoutManager.bodyEventHandler).not.toBeFalsy();
      expect(LayoutManager.diagramEventHandler).not.toBeFalsy();
      expect(LayoutManager.fingerEventHandler).not.toBeFalsy();
    });

    var isComponent = function (key) {
      return function (component) {
        return component.get('key') === key;
      };
    };

    var isSelected = function (component) {
      return component.get('selected') || false;
    };

    var uniqueKeyProvider = function (key) {
      return function () {
        return key;
      };
    };

    var resistorWithKey = function (key) {
      var resistor = Resistor.model().objectify()
        .keyify(uniqueKeyProvider(key))
        .model();
      return resistor;
    };

    var diagramWithComponent = function (component) {
      var diagram = Diagram.model().objectify()
        .addComponent(component)
        .model();
      return diagram;
    };

    var spaghettiWithDiagram = function (diagram) {
      dissect(Spaghetti.state,
        set('diagram', diagram));
      return Spaghetti;
    };

    describe('component event handler', function () {
      it('should return a specialized instance with onDragStart, onDrag and onDragEnd functions', function () {
        var component = Immutable.fromJS({});
        var handler = LayoutManager.componentEventHandler(component);
        expect(handler.onDragStart).not.toBeFalsy();
        expect(handler.onDrag).not.toBeFalsy();
        expect(handler.onDragStop).not.toBeFalsy();
      });

      it('should move the component when onDrag is called', function () {
        var key = 9999,
          resistor = resistorWithKey(key),
          diagram = diagramWithComponent(resistor),
          Spaghetti = spaghettiWithDiagram(diagram);

        var handler = LayoutManager.componentEventHandler(resistor),
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
              }))));
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
              }))));
      });
    });

    describe('diagram event handler', function () {
      it('should return a specialized instance with onClick function', function () {
        var component = Immutable.fromJS({});
        var handler = LayoutManager.diagramEventHandler(component);
        expect(handler.onClick).not.toBeFalsy();
      });

      it('should delete the selected components when onClick is called and Ctrl is pressed', function () {
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
  });
});