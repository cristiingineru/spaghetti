/* global define */


define(['react', 'immutable.min', 'app/core', 'app/part-finger'], function (React, Immutable, Core, partFinger) {

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
        x: this.props.model.get('x') - width / 2,
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
      leg = leg.get('updateFinger')(leg);
      return leg;
    },
    setY: function (leg, y) {
      return leg.set('y', y);
    },
    setDirection: function (leg, direction) {
      leg = leg.set('direction', direction);
      leg = leg.get('updateFinger')(leg);
      return leg;
    },
    setLength: function (leg, length) {
      return leg.set('length', length);
    },
    updateFinger: function (leg) {
      var x = leg.get('x');
      var y = leg.get('y');
      var direction = leg.get('direction');
      var length = leg.get('length');
      var finger = leg.getIn(['finger']);
      var fingerX = Core.cursorify(finger.deref()).cursor();
      fingerX = fingerX.get('setX')(fingerX, x);
      fingerX = fingerX.get('setY')(fingerX, (direction === 'up' ? (y - length) : (y + length)));
      leg = leg.set('finger', fingerX.deref());
      return leg;
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