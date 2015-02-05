/* global define, dissect, update */


define(['React', 'immutable.min', 'app/core', 'app/part-finger'], function (React, Immutable, Core, partFinger) {

  var drawLeg = function (x, y, x2, y2, direction) {
    var cx1 = x,
      cy1 = (y + y2) / 2,
      start = 'M' + x.toFixed(2) + ',' + y.toFixed(2),
      control1 = 'C' + cx1.toFixed(2) + ',' + cy1.toFixed(2),
      control2 = cx1.toFixed(2) + ',' + cy1.toFixed(2),
      end = x2.toFixed(2) + ',' + y2.toFixed(2);
    return start + ' ' + control1 + ' ' + control2 + ' ' + end;
  };

  var legClass = React.createClass({
    displayName: 'part-leg',
    getDefaultProps: function () {
      return {
        model: null,
        owner: null
      };
    },
    render: function () {
      var width = 2,
        length = this.props.model.get('length'),
        direction = this.props.model.get('direction'),
        x = this.props.model.get('x'),
        y = this.props.model.get('y'),
        x2 = this.props.model.get('x2'),
        y2 = this.props.model.get('y2'),
        connected = this.props.model.get('connected'),
        color = connected ? '#777777' : '#e03434';
      var leg = React.createElement('path', {
        d: drawLeg(x, y, x2, y2, direction),
        stroke: color,
        strokeWidth: 3,
        fillOpacity: 0.0
      });
      var finger = React.createElement(partFinger.class(), {
        model: this.props.model.get('finger'),
        owner: this.props.model
      });
      return React.createElement('g', {
        className: 'part-leg'
      }, [leg, finger]);
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
    thisProto.tryToSetX2Y2 = function (x2, y2) {
      model = model
        .set('x2', x2)
        .set('y2', y2)
        .set('fixedEnd', true);
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
    thisProto.connectTo = function (holeKey) {
      model = model.set('holeKey', holeKey)
        .set('connected', true);
      var finger = model.getIn(['finger']).objectify()
        .connectTo(holeKey)
        .model();
      model = model.set('finger', finger);
      return this;
    };
    thisProto.disconnect = function () {
      model = model.delete('holeKey')
        .set('connected', false);
      var finger = model.getIn(['finger']).objectify()
        .disconnect()
        .model();
      model = model.set('finger', finger);
      return this;
    };
    thisProto.updateFinger = function () {
      var x = model.get('x'),
        y = model.get('y'),
        direction = model.get('direction'),
        length = model.get('length'),
        fixedEnd = model.get('fixedEnd'),
        x2 = model.get('x2'),
        y2 = model.get('y2');
      if (!fixedEnd) {
        x2 = x;
        y2 = (direction === 'up' ? (y - length) : (y + length));
        model = model
          .set('x2', x2)
          .set('y2', y2);
      }
      var finger = model.getIn(['finger']).objectify()
        .setXY(x2, y2)
        .model();
      model = model.set('finger', finger);
      return this;
    };
    thisProto.keyify = function (keyProvider) {
      model = model.set('key', keyProvider());
      model = dissect(model,
        update('finger', function (finger) {
          return finger.objectify()
            .keyify(keyProvider)
            .model();
        })
      );
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
    x2: 0,
    y2: 0,
    direction: 'up',
    length: 30,
    finger: partFinger.model(),
    proto: legProto
  });

  var leg = legProto(legModel);
  legModel = leg
    .init()
    .model();

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