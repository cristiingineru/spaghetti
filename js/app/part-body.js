/* global define */

define(['react', 'app/part-body'], function (React) {

  var bodyClass = React.createClass({
    displayName: 'part-body',
    getDefaultProps: function () {
      return {
        x: 0,
        y: 0,
        width: 20,
        height: 60
      };
    },
    render: function () {
      return React.createElement('rect', {
        x: this.props.x,
        y: this.props.y,
        width: this.props.width,
        height: this.props.height,
        stroke: '#005500',
        fill: '#005500',
        rx: 2,
        ry: 2
      });
    }
  });

  var bodyModel = 'TODO';

  return {
    class: bodyClass,
    model: bodyModel
  };
});