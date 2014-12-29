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

  var resistorModel = Immutable.fromJS({
    x: 0,
    y: 0,
    width: 20,
    height: 40,
    body: partBody.model(),
    legs: [partLeg.model(), partLeg.model()],
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
      var x = resistor.get('x');
      var y = resistor.get('y');

      var body = resistor.getIn(['body']).deref().cursor().objectify()
        .setX(x)
        .setY(y)
        .setWidth(20)
        .setHeight(40);
      resistor = resistor.set('body', body.deref());

      var leg0 = resistor.getIn(['legs', 0]).deref().cursor().objectify()
        .setX(x + 10)
        .setY(y)
        .setDirection('up');
      var leg1 = resistor.getIn(['legs', 1]).deref().cursor().objectify()
        .setX(x + 10)
        .setY(y + 40)
        .setDirection('down');
      var legs = Immutable.fromJS([leg0.deref(), leg1.deref()]);
      resistor = resistor.set('legs', legs);

      return resistor;
    },
    init: function (resistor) {
      return resistor.get('updateParts')(resistor);
    },
    getName: function (resistor) {
      return 'resistor';
    }
  });
  resistorModel = resistorModel.cursor();
  resistorModel = resistorModel.get('init')(resistorModel).deref();

  return {
    name: function () {
      return resistorModel.get('getName')();
    },
    class: function () {
      return resistorClass;
    },
    model: function () {
      return resistorModel;
    }
  };
});