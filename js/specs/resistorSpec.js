/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where */


define(['app/component-resistor', 'immutable.min', 'app/layoutManager', 'React'], function (Resistor, Immutable, LayoutManager, React) {
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

  var TestUtils = React.addons.TestUtils;

  describe('Resistor class', function () {
    it('should render a body and two legs', function () {
      var resistor = React.createElement(Resistor.class(), {
          model: Resistor.model()
        }),
        renderedResistor = TestUtils.renderIntoDocument(resistor);

      var legs = TestUtils.scryRenderedDOMComponentsWithTag(renderedResistor, 'leg'),
        bodys = TestUtils.scryRenderedDOMComponentsWithTag(renderedResistor, 'body');

      expect(legs.count()).toBe(2);
      expect(bodys.count()).toBe(1);
    });
  });
});