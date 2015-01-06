/* global define */


define(['React', 'immutable.min', 'app/core', 'app/part-finger'], function (React, Immutable, Core, partFinger) {

  var legClass = React.createClass({
    displayName: 'part-leg',
    getDefaultProps: function () {
      return {
        model: null,
        owner: null
      };
    },
    render: function () {
      var width = 2;
      var length = this.props.model.get('length');
      var direction = this.props.model.get('direction');
      var finger = React.createElement(partFinger.class(), {
        model: this.props.model.get('finger'),
        owner: this.props.model
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

  var legProto = function (model) {
    var thisProto = Object.create(null);
    thisProto.model = function () {
      return model;
    };
    thisProto.setX = function (x) {
      model = model.set('x', x);
      return this.updateFinger();
    };
    thisProto.setY = function (y) {
      model = model.set('y', y);
      return this.updateFinger();
    };
    thisProto.setXY = function (x, y) {
      model = model.set('x', x);
      model = model.set('y', y);
      return this.updateFinger();
    };
    thisProto.setDirection = function (direction) {
      model = model.set('direction', direction);
      return this.updateFinger();
    };
    thisProto.setLength = function (length) {
      model = model.set('length', length);
      return this.updateFinger();
    };
    thisProto.updateFinger = function () {
      var x = model.get('x');
      var y = model.get('y');
      var direction = model.get('direction');
      var length = model.get('length');
      var finger = model.getIn(['finger']).deref().cursor().objectify()
        .setXY(x, (direction === 'up' ? (y - length) : (y + length)))
        .model();
      model = model.set('finger', finger.deref());
      return this;
    };
    thisProto.init = function () {
      return this.updateFinger();
    };
    return thisProto;
  };

  var legModel = Immutable.fromJS({
    x: 0,
    y: 0,
    direction: 'up',
    length: 30,
    finger: partFinger.model(),
    proto: legProto
  });

  var leg = legProto(legModel.cursor());
  legModel = leg
    .init()
    .model().deref();

  return {
    class: function () {
      return legClass;
    },
    proto: function () {
      return legProto;
    },
    model: function () {
      return legModel;
    }
  };
});