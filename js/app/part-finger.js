/* global define, require */


define(['React', 'react.draggable', 'immutable.min', 'app/keyProvider'], function (React, Draggable, Immutable, KeyProvider) {

  var fingerClass = React.createClass({
    displayName: 'part-finger',
    getDefaultProps: function () {
      return {
        model: null,
        owner: null
      };
    },
    render: function () {
      var LayoutManager = require('app/layoutManager'),
        eventHandler = LayoutManager.fingerEventHandler(this.props.model),
        radius = 3;
      var circle = React.createElement('circle', {
        r: radius,
        cx: this.props.model.get('x'),
        cy: this.props.model.get('y'),
        stroke: '#333333',
        fill: '#333333'
      });
      // this wrapper is required to make the react.draggable work
      var circleWrapper = React.createElement('g', null, circle);
      return React.createElement(Draggable, {
        axis: 'both',
        onStart: eventHandler.onDragStart,
        onDrag: eventHandler.onDrag,
        onStop: eventHandler.onDragStop
      }, circleWrapper);
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
    thisProto.keyify = function (keyProvider) {
      var key = keyProvider();
      model = model.set('key', key);
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