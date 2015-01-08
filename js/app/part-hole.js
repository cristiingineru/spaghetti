/* global define */


define(['React', 'immutable.min'], function (React, Immutable) {

  var holeClass = React.createClass({
    displayName: 'part-hole',
    getDefaultProps: function () {
      return {
        model: null
      };
    },
    render: function () {
      var radius = 2;
      return React.createElement('circle', {
        r: radius,
        cx: this.props.model.get('x'),
        cy: this.props.model.get('y'),
        stroke: '#cecece',
        fill: '#cecece'
      });
    }
  });
  
  var holeProto = function (model) {
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
    thisProto.keyify = function (keyProvider) {
      var key = keyProvider();
      model = model.set('key', key);
      return this;
    };
    return thisProto;
  };

  var holeModel = Immutable.fromJS({
    x: 0,
    y: 0,
    proto: holeProto
  });

  return {
    class: function () {
      return holeClass;
    },
    proto: function () {
      return holeProto;
    },
    model: function () {
      return holeModel;
    }
  };
});