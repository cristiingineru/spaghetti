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

  var body = partBody.model();
  body = body.get('setX')(body, 0);
  body = body.get('setY')(body, 0);
  body = body.get('setWidth')(body, 20);
  body = body.get('setHeight')(body, 40);
  var leg1 = partLeg.model();
  leg1 = leg1.get('setX')(leg1, 10);
  leg1 = leg1.get('setY')(leg1, 0);
  leg1 = leg1.get('setDirection')(leg1, 'up');
  var leg2 = partLeg.model();
  leg2 = leg2.get('setX')(leg2, 10);
  leg2 = leg2.get('setY')(leg2, 40);
  leg2 = leg2.get('setDirection')(leg2, 'down');
  var resistorModel = Immutable.fromJS({
    x: 0,
    y: 0,
    width: 20,
    height: 40,
    body: body,
    legs: [leg1, leg2]
  });

  return {
    class: function () {
      return resistorClass;
    },
    model: function () {
      return resistorModel;
    }
  };
});