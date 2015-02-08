/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine */


define(['app/layoutManager', 'immutable.min', 'Squire', 'app/component-resistor', 'app/dissect', ], function (LayoutManager, Immutable, Squire, Resistor, Dissect) {
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

      var addComponentToTopLevelDiagram = function (Stcomponent) {};

      it('should move the component when onDrag is called', function (done) {
        var squire = new Squire()
          .require(['app/state'], function (State2) {
            var keyProvider = function () {
              return 9999;
            };
            var component = Resistor.model().objectify().keyify(keyProvider).model();
            var handler = LayoutManager.componentEventHandler(component);
            State2.cursor().set('diagram', {
              components: []
            });
            State2.cursor().cursor(['diagram', 'components'])
              .add(0, component);

            var event = {
              clientX: 888,
              clientY: 999
            };
            handler.onDrag(event);

            var movedComponent = State2.cursor().getIn(['diagram', 0]);
            expect(movedComponent.get('x')).toBe(888);
            expect(movedComponent.get('y')).toBe(999);

            done();
          });
      });
    });
  });
});