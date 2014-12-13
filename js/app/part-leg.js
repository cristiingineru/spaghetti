/* global define */


define(['react', 'app/part-finger'], function (React, partFinger) {

  var legClass = React.createClass({
    displayName: 'part-leg',
    getDefaultProps: function () {
      return {
        x: 0,
        y: 0,
        direction: 'up',
        length: 30
      };
    },
    render: function () {
      var width = 2;
      var finger = React.createElement(partFinger.class, {
        x: this.props.x,
        y: this.props.direction === 'down' ? (this.props.y + this.props.length) : (this.props.y - this.props.length)
      });
      var rect = React.createElement('rect', {
        x: this.props.x - width / 2,
        y: this.props.direction === 'down' ? this.props.y : (this.props.y - this.props.length),
        width: width,
        height: this.props.length,
        stroke: '#777777',
        fill: '#777777'
      });
      return React.createElement('g', null, [rect, finger]);
    }
  });

  var legModel = 'TODO';

  return {
    class: legClass,
    model: legModel
  };
});