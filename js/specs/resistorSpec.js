/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where */


define(['app/component-resistor', 'immutable.min', 'app/layoutManager', 'React', 'app/part-leg', 'app/part-body'], function (Resistor, Immutable, LayoutManager, React, Leg, Body) {
  describe('Resistor', function () {
    it('should provide a known API', function () {
      expect(typeof (Resistor.name)).toBe('function');
      expect(typeof (Resistor.name())).toBe('string');

      expect(typeof (Resistor.class)).toBe('function');
      expect(Resistor.class).not.toThrow();

      expect(typeof (Resistor.proto)).toBe('function');
      expect(Resistor.proto).not.toThrow();

      expect(typeof (Resistor.model)).toBe('function');
      var model = Resistor.model();
      expect(Immutable.Seq.isSeq(model) || Immutable.Map.isMap(model)).toBe(true);
    });
  });

  describe('Resistor class', function () {

    var TestUtils = React.addons.TestUtils;
    var renderDefaultResistor = function () {
      var resistor = React.createElement(Resistor.class(), {
        model: Resistor.model()
      });
      return TestUtils.renderIntoDocument(resistor);
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
      var renderedResistor = renderDefaultResistor();
      var legs = TestUtils.scryRenderedComponentsWithType(renderedResistor, Leg.class());
      var bodys = TestUtils.scryRenderedComponentsWithType(renderedResistor, Body.class());
      expect(legs.length).toBe(2);
      expect(bodys.length).toBe(1);
    });

    it('should have a draggable body', function () {
      var renderedResistor = renderDefaultResistor();
      var body = TestUtils.findRenderedDOMComponentWithClass(renderedResistor, 'part-body');
      expect(isDraggable(body, renderedResistor)).toBe(true);
    });

    xit('should forword the onDragStart, onDrag and onDragStop to the componentLayoutManager');
  });

  describe('Resistor proto', function () {
    xit('should have a keyify function that set a unique key to itself and child parts');

    xit('should have an init function that initialize the child parts');

    xit('should update the coordinates of the parts when its owned position is changed');
  });

  describe('Resistor model', function () {
    it('should be an immutable map', function () {
      var model = Resistor.model();
      expect(Immutable.Map.isMap(model)).toBe(true);
    });

    it('should have a name and a proto properties', function () {
      var model = Resistor.model();
      expect(model.get('name')).not.toBeFalsy();
      expect(model.get('proto')).not.toBeFalsy();
    });
  });
});