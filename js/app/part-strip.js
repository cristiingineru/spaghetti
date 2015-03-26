/* global define, dissect, update */


define(['React', 'immutable.min', 'app/core', 'app/part-hole'], function (React, Immutable, Core, partHole) {

  var stripClass = React.createClass({
    displayName: 'strip',
    getDefaultProps: function () {
      return {
        model: null
      };
    },
    render: function () {}
  });

  var stripProto = function (model) {
    var thisProto = Object.create(null);
    thisProto.model = function () {
      return model;
    };
    thisProto.setXY = function (x, y) {
      model = model.set('x', x);
      model = model.set('y', y);
      return this.updateFinger();
    };
    thisProto.setOrientation = function (orientation) {
      model = model.set('orientation', orientation);
      return this.updateFinger();
    };
    thisProto.setHoleCount = function (holeCount) {
      model = model.set('holeCount', holeCount);
      return this;
    };
    thisProto.keyify = function (keyProvider) {
      model = model.set('key', keyProvider());
      return this;
    };
    thisProto.init = function () {
      return this;
    };
    return thisProto;
  };

  var stripModel = Immutable.fromJS({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    orientation: 'horizontal',
    holeCount: 5,
    proto: stripProto
  });

  var strip = stripProto(stripModel);
  stripModel = strip
    .init()
    .model();

  return {
    class: function () {
      return stripClass;
    },
    proto: function () {
      return stripProto;
    },
    model: function () {
      return stripModel;
    }
  };
});