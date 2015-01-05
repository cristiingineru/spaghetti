/* global define */


define(['React', 'immutable.min'], function (React, Immutable) {

  var fingerClass = React.createClass({
    displayName: 'part-finger',
    getDefaultProps: function () {
      return {
        model: null
      };
    },
    render: function () {
      var radius = 4;
      return React.createElement('circle', {
        r: radius,
        cx: this.props.model.get('x'),
        cy: this.props.model.get('y'),
        stroke: '#333333',
        fill: '#333333'
      });
    }
  });

  var fingerModel = Immutable.fromJS({
    x: 0,
    y: 0,
    setX: function (finger, x) {
      return finger.set('x', x);
    },
    setY: function (finger, y) {
      return finger.set('y', y);
    },
    setXY: function (finger, x, y) {
      finger = finger.set('x', x);
      return finger.set('y', y);
    }
  });

  return {
    class: function () {
      return fingerClass;
    },
    model: function () {
      return fingerModel;
    }
  };
});