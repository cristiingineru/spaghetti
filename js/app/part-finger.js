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
  
  var fingerProto = function (model) {
    var thisProto = Object.create(null);
    thisProto.model = function () {
      return model;
    };
    thisProto.setX = function (x) {
      model = model.set('x', x);
      return this;
    };
    thisProto.setY = function (y) {
      model = model.set('y', y);
      return this;
    };
    thisProto.setXY = function (x, y) {
      model = model.set('x', x);
      model = model.set('y', y);
      return this;
    };
    return thisProto;
  };

  var fingerModel = Immutable.fromJS({
    x: 0,
    y: 0,
    proto: fingerProto
  });

  return {
    class: function () {
      return fingerClass;
    },
    proto: function () {
      return fingerProto;
    },
    model: function () {
      return fingerModel;
    }
  };
});