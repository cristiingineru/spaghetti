/* global define */


define(['react', 'immutable.min', 'app/core', 'app/part-leg', 'app/part-body'], function (React, Immutable, Core, partLeg, partBody) {

  var resistorClass = React.createClass({
    displayName: 'component-resistor',
    getDefaultProps: function () {
      return {
        model: null
      };
    },
    render: function () {
      var leg1 = React.createElement(partLeg.class(), {
        model: this.props.model.getIn(['legs', 0])
      });
      var leg2 = React.createElement(partLeg.class(), {
        model: this.props.model.getIn(['legs', 1])
      });
      var body = React.createElement(partBody.class(), {
        model: this.props.model.get('body')
      });
      return React.createElement('g', null, [leg1, leg2, body]);
    }
  });

  var body = partBody.model().cursor().objectify()
    .setX(0)
    .setY(0)
    .setWidth(20)
    .setHeight(40);
  var leg1 = partLeg.model().cursor().objectify()
    .setX(10)
    .setY(0)
    .setDirection('up');
  var leg2 = partLeg.model().cursor().objectify()
    .setX(10)
    .setY(40)
    .setDirection('down');
  var resistorModel = Immutable.fromJS({
    x: 0,
    y: 0,
    width: 20,
    height: 40,
    body: body.deref(),
    legs: [leg1.deref(), leg2.deref()],
    setX: function (resistor, x) {
      resistor = resistor.set('x', x);
      resistor = resistor.get('updateParts')(resistor);
      return resistor;
    },
    setY: function (resistor, y) {
      resistor = resistor.set('y', y);
      resistor = resistor.get('updateParts')(resistor);
      return resistor;
    },
    updateParts: function (resistor) {
      return resistor;
    }
  });

  return {
    name: function () {
      return 'resistor';
    },
    class: function () {
      return resistorClass;
    },
    model: function () {
      return resistorModel;
    }
  };
});