/* global define */


define(['React', 'immutable.min', 'app/core', 'app/part-finger'], function (React, Immutable, Core, partFinger) {

  var legClass = React.createClass({
    displayName: 'part-leg',
    getDefaultProps: function () {
      return {
        model: null
      };
    },
    render: function () {
      var width = 2;
      var length = this.props.model.get('length')
      var direction = this.props.model.get('direction');
      var finger = React.createElement(partFinger.class(), {
        model: this.props.model.get('finger')
      });
      var rect = React.createElement('rect', {
        x: this.props.model.get('x') - width / 2,
        y: this.props.model.get('y') - (direction === 'up' ? length : 0),
        width: width,
        height: length,
        stroke: '#777777',
        fill: '#777777'
      });
      return React.createElement('g', null, [rect, finger]);
    }
  });

  var legModel = Immutable.fromJS({
    x: 0,
    y: 0,
    direction: 'up',
    length: 30,
    finger: partFinger.model(),
    setX: function (leg, x) {
      leg = leg.set('x', x);
      leg = leg.get('updateFinger')(leg);
      return leg;
    },
    setY: function (leg, y) {
      leg = leg.set('y', y);
      leg = leg.get('updateFinger')(leg);
      return leg;
    },
    setDirection: function (leg, direction) {
      leg = leg.set('direction', direction);
      leg = leg.get('updateFinger')(leg);
      return leg;
    },
    setLength: function (leg, length) {
      leg.set('length', length);
      leg = leg.get('updateFinger')(leg);
      return leg;
    },
    updateFinger: function (leg) {
      var x = leg.get('x');
      var y = leg.get('y');
      var direction = leg.get('direction');
      var length = leg.get('length');
      var finger = leg.getIn(['finger']).deref().cursor().objectify()
        .setX(x)
        .setY((direction === 'up' ? (y - length) : (y + length)));
      leg = leg.set('finger', finger.deref());
      return leg;
    },
    init: function(leg) {
      return leg.get('updateFinger')(leg);
    }
  });
  legModel = legModel.cursor();
  legModel = legModel.get('init')(legModel).deref();

  return {
    class: function () {
      return legClass;
    },
    model: function () {
      return legModel;
    }
  };
});