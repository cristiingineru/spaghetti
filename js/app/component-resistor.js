/* global define */


define(['react', 'app/part-leg', 'app/part-body'], function (React, partLeg, partBody) {

  var resistorClass = React.createClass({
    displayName: 'component-resistor',
    getDefaultProps: function () {
      return {
        x: 0,
        y: 0,
        width: 20,
        height: 40
      };
    },
    render: function () {
      var leg1 = React.createElement(partLeg.class, {
        x: this.props.x + this.props.width / 2,
        y: this.props.y,
        direction: 'up'
      });
      var leg2 = React.createElement(partLeg.class, {
        x: this.props.x + this.props.width / 2,
        y: this.props.y + this.props.height,
        direction: 'down'
      });
      var body = React.createElement(partBody.class, {
        x: this.props.x,
        y: this.props.y,
        width: this.props.width,
        height: this.props.height
      });
      return React.createElement('g', null, [leg1, leg2, body]);
    }
  });

  var resistorModel = 'TODO';

  return {
    class: resistorClass,
    model: resistorModel
  };
});