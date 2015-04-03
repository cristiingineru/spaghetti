/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine */


define(['app/component-capacitor', 'Squire', 'immutable.min', 'app/layoutManager', 'React', 'app/part-leg', 'app/part-body', 'mocks/bodyMock'], function (Capacitor, Squire, Immutable, LayoutManager, React, Leg, Body, BodyMock) {
  describe('Capacitor', function () {
    it('should provide a known API', function () {
      expect(typeof (Capacitor.name)).toBe('function');
      expect(typeof (Capacitor.name())).toBe('string');

      expect(typeof (Capacitor.class)).toBe('function');
      expect(Capacitor.class).not.toThrow();

      expect(typeof (Capacitor.proto)).toBe('function');
      expect(Capacitor.proto).not.toThrow();

      expect(typeof (Capacitor.model)).toBe('function');
      expect(Capacitor.model).not.toThrow();
    });
  });

  describe('Capacitor class', function () {

    var TestUtils = React.addons.TestUtils;
    var renderDefaultCapacitor = function () {
      var capacitor = React.createElement(Capacitor.class(), {
        model: Capacitor.model()
      });
      return TestUtils.renderIntoDocument(capacitor);
    };
    var renderDefaultCapacitor2 = function (component) {
      var capacitor = React.createElement(component.class(), {
        model: component.model()
      });
      return TestUtils.renderIntoDocument(capacitor);
    };
    var isDraggable = function ( /*DOMComponent*/ part, /*ReactComponent*/ root) {
      var allDraggables = TestUtils.scryRenderedDOMComponentsWithClass(root, 'react-draggable');

      var draggableParent = allDraggables.filter(function (draggable) {
        var deepChildren = TestUtils.findAllInRenderedTree(draggable, function () {
          return true;
        });
        return deepChildren.indexOf(part) >= 0;
      }).shift();

      return draggableParent !== undefined;
    };

    it('should render a body and two legs', function () {
      var renderedCapacitor = renderDefaultCapacitor();
      var legs = TestUtils.scryRenderedComponentsWithType(renderedCapacitor, Leg.class());
      var bodys = TestUtils.scryRenderedComponentsWithType(renderedCapacitor, Body.class());
      expect(legs.length).toBe(2);
      expect(bodys.length).toBe(1);
    });

    it('should have a draggable body', function () {
      var renderedCapacitor = renderDefaultCapacitor();
      var body = TestUtils.findRenderedDOMComponentWithClass(renderedCapacitor, 'body');
      expect(isDraggable(body, renderedCapacitor)).toBe(true);
    });

    xit('should forword the onDragStart, onDrag and onDragStop to the componentLayoutManager', function (done) {
      var componentEventHandlerMock = {
        onDragStart: function () {},
        onDrag: function () {},
        onDragStop: function () {}
      };
      var layoutManagerMock = {
        componentEventHandler: function (model) {
          return componentEventHandlerMock;
        }
      };
      spyOn(componentEventHandlerMock, 'onDragStart');
      spyOn(componentEventHandlerMock, 'onDrag');
      spyOn(componentEventHandlerMock, 'onDragStop');
      var squire = new Squire()
        .mock('app/layoutManager', layoutManagerMock)
        .require(['app/component-capacitor', 'app/part-body'], function (Capacitor2, Body2) {
          var renderedCapacitor = renderDefaultCapacitor2(Capacitor2);
          var body = TestUtils.findRenderedComponentWithType(renderedCapacitor, Body2.class());
          var draggable = TestUtils.scryRenderedDOMComponentsWithClass(renderedCapacitor, 'react-draggable')[0];
          React.addons.TestUtils.Simulate.mouseDown(body);
          React.addons.TestUtils.Simulate.mouseMove(body);
          React.addons.TestUtils.Simulate.mouseUp(body);
          expect(componentEventHandlerMock.onDragStart).toHaveBeenCalled();
          expect(componentEventHandlerMock.onDrag).toHaveBeenCalled();
          expect(componentEventHandlerMock.onDragStop).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('Capacitor proto', function () {
    it('should have a keyify function that set a unique key to itself and child parts', function () {
      var hardCodedUniqueKey = 9999;
      var keyProvider = jasmine.createSpy('keyProvider').and.returnValue(hardCodedUniqueKey);
      var capacitor = Capacitor.model().objectify()
        .keyify(keyProvider)
        .model();
      expect(keyProvider.calls.count()).toBeGreaterThan(3);
      [
        capacitor.get('key'),
        capacitor.getIn(['body', 'key']),
        capacitor.getIn(['legs', '0', 'key']),
        capacitor.getIn(['legs', '1', 'key'])
      ].forEach(function (key) {
        expect(key).toBe(hardCodedUniqueKey);
      });
    });

    it('should have an init function that personalize the child parts', function (done) {
      var squire = new Squire()
        .mock('app/part-body', BodyMock)
        .require(['app/component-capacitor'], function (Capacitor2) {
          var capacitor = Capacitor2.model().objectify()
            .init()
            .model();
          var bodyProto = capacitor.get('body').objectify();
          expect(bodyProto.setXY).toHaveBeenCalled();
          expect(bodyProto.setWidth).toHaveBeenCalled();
          expect(bodyProto.setHeight).toHaveBeenCalled();
          done();
        });
    });

    it('should update the coordinates of the parts when its own position is changed', function () {
      // setting some random coordinates
      var capacitor = Capacitor.model().objectify().init().setXY(0, 0).model();
      // setting other coordinates again and asserting that this component and its parts moved
      var movedCapacitor = capacitor.objectify().setXY(9999, 9999).model();
      [
        {
          original: capacitor,
          moved: movedCapacitor
        },
        {
          original: capacitor.get('body'),
          moved: movedCapacitor.get('body')
        },
        {
          original: capacitor.getIn(['legs', 0]),
          moved: movedCapacitor.getIn(['legs', 0])
        },
        {
          original: capacitor.getIn(['legs', 1]),
          moved: movedCapacitor.getIn(['legs', 1])
        }
      ].forEach(function (pair) {
        expect(pair.moved.get('x')).not.toBe(pair.original.get('x'));
        expect(pair.moved.get('y')).not.toBe(pair.original.get('y'));
      });
    });
  });

  describe('Capacitor model', function () {
    it('should be an immutable map', function () {
      var model = Capacitor.model();
      expect(Immutable.Map.isMap(model)).toBe(true);
    });

    it('should have name, proto, x and y properties', function () {
      var model = Capacitor.model();
      expect(model.get('name')).not.toBeFalsy();
      expect(model.get('proto')).not.toBeFalsy();
      expect(model.get('x')).toEqual(jasmine.any(Number));
      expect(model.get('y')).toEqual(jasmine.any(Number));
    });
  });
});