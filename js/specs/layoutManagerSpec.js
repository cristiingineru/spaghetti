/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine, set, beforeEach, afterEach */


define(['app/layoutManager', 'immutable.min', 'Squire', 'app/component-resistor', 'app/diagram', 'app/dissect', 'app/spaghetti'], function (LayoutManager, Immutable, Squire, Resistor, Diagram, Dissect, Spaghetti) {
  describe('LayoutManager', function () {
    it('should return component, diagram and finger event handlers', function () {
      expect(LayoutManager.componentEventHandler).not.toBeFalsy();
      expect(LayoutManager.diagramEventHandler).not.toBeFalsy();
      expect(LayoutManager.fingerEventHandler).not.toBeFalsy();
    });

    describe('component event handler', function () {
      it('should return a specialized instance with a known API', function () {
        var component = Immutable.fromJS({});
        var handler = LayoutManager.componentEventHandler(component);
        expect(handler.onDragStart).not.toBeFalsy();
        expect(handler.onDrag).not.toBeFalsy();
        expect(handler.onDragStop).not.toBeFalsy();
      });

      beforeEach(function () {
        Spaghetti.init();
      });

      afterEach(function () {
        Spaghetti.init();
      });

      var isComponent = function (key) {
        return function (component) {
          return component.get('key') === key;
        };
      };

      // make this a module
      var uniqueKeyProvider = function (key) {
        return function () {
          return key;
        };
      };

      var diagramWithComponent = function (component) {
        var diagram = Diagram.model().objectify()
          .addComponent(component)
          .model();
        return diagram;
      };

      it('should move the component when onDrag is called', function (done) {
        var squire = new Squire()
          .require([], function () {
            var keyToMyComponent = 9999;
            var component = Resistor.model().objectify()
              .keyify(uniqueKeyProvider(keyToMyComponent))
              .model();
            var myTopDiagram = diagramWithComponent(component);
            dissect(Spaghetti.state,
              set('diagram', myTopDiagram));

            var handler = LayoutManager.componentEventHandler(component);
            var event = {
              clientX: 888,
              clientY: 999
            };
            handler.onDrag(event);



            dissect(Spaghetti.state,
              update('diagram',
                updateAll('components',
                  where(isComponent(9999), function (myComponent) {
                    expect(myComponent.get('x')).toBe(888);
                    expect(myComponent.get('y')).toBe(999);
                  }))));

            done();
          });
      });
    });
  });
});