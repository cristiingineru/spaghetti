/* global define */

define(['React', 'immutable.min'], function (React, Immutable) {

  var holeClass = React.createClass({
    displayName: 'hole',
    getDefaultProps: function () {
      return {
        model: null
      };
    },
    render: function () {
      var radius = 3;
      var circle = React.createElement('circle', {
        cx: this.props.model.get('x'),
        cy: this.props.model.get('y'),
        r: radius
      });
      var decorators = [];
      if (this.props.model.get('hovered')) {
        decorators.push(React.createElement('circle', {
          cx: this.props.model.get('x'),
          cy: this.props.model.get('y'),
          r: radius + 2,
          className: 'holeDecorator'
        }));
      }
      return React.createElement('g', {
        className: 'hole'
      }, [circle].concat(decorators));
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
    thisProto.setHovered = function (hovered) {
      model = model.set('hovered', hovered);
      return this;
    };
    thisProto.connectTo = function (legKey) {
      model = model.set('legKey', legKey)
        .set('connected', true);
      return this;
    };
    thisProto.disconnect = function () {
      model = model.delete('legKey')
        .set('connected', false);
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
    hovered: false,
    proto: holeProto
  });

  var PartHole = function () {

    this.class = function () {
      return holeClass;
    };

    this.proto = function () {
      return holeProto;
    };

    this.model = function () {
      return holeModel;
    };
  };

  partHole = new PartHole();

  return PartHole;
});