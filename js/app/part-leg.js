/* global define */


define(['react', 'immutable.min', 'app/part-finger'], function (React, Immutable, partFinger) {

  var legClass = React.createClass({
    displayName: 'part-leg',
    getDefaultProps: function () {
      return {
        model: null
      };
    },
    render: function () {
      var width = 2;
      var finger = React.createElement(partFinger.class(), {
        model: this.props.model.get('finger')
      });
      var rect = React.createElement('rect', {
        x: this.props.model.get('x'),
        y: this.props.model.get('y'),
        width: width,
        height: this.props.model.get('length'),
        stroke: '#777777',
        fill: '#777777'
      });
      return React.createElement('g', null, [rect, finger]);
    }
  });

  var finger = partFinger.model();
  finger = finger.get('setX')(finger, 0);
  finger = finger.get('setY')(finger, 0);
  var legModel = Immutable.fromJS({
    x: 0,
    y: 0,
    direction: 'up',
    length: 30,
    finger: finger,
    setX: function (leg, x) {
      leg = leg.set('x', x);
      var finger = leg.getIn(['finger']);
      finger.get('setX')(finger, x);
      return leg;
    },
    setY: function (leg, y) {
      return leg.set('y', y);
    },
    setDirection: function (leg, direction) {
      return leg.set('direction', direction);
    },
    setLength: function (leg, length) {
      return leg.set('length', length);
    }
  });

  return {
    class: function () {
      return legClass;
    },
    model: function () {
      return legModel;
    }
  };
});