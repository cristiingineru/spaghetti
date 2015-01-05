/* global define */

define(['React', 'immutable.min', 'app/core'], function (React, Immutable, Core) {

  var bodyClass = React.createClass({
    displayName: 'part-body',
    getDefaultProps: function () {
      return {
        model: null
      };
    },
    render: function () {
      return React.createElement('rect', {
        x: this.props.model.get('x'),
        y: this.props.model.get('y'),
        width: this.props.model.get('width'),
        height: this.props.model.get('height'),
        stroke: '#ceb27a',
        fill: '#E6C88C',
        rx: 4,
        ry: 4
      });
    }
  });

  var bodyModel = Immutable.fromJS({
    x: 0,
    y: 0,
    width: 20,
    height: 60,
    setX: function (body, x) {
      return body.set('x', x);
    },
    setY: function (body, y) {
      return body.set('y', y);
    },
    setXY: function (body, x, y) {
      body = body.set('x', x);
      return body.set('y', y);
    },
    setWidth: function (body, width) {
      return body.set('width', width);
    },
    setHeight: function (body, height) {
      return body.set('height', height);
    }
  });

  return {
    class: function () {
      return bodyClass;
    },
    model: function () {
      return bodyModel;
    }
  };
});