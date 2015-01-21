/* global define, require, dissect, update */


define(['React', 'react.draggable', 'immutable.min', 'app/core', 'app/keyProvider', 'app/part-hole'], function (React, Draggable, Immutable, Core, KeyProvider, partHole) {

  var breadboardClass = React.createClass({
    displayName: 'component-breadboard',
    getDefaultProps: function () {
      return {
        model: null
      };
    },
    shouldComponentUpdate: function (nextProps, nextState, nextContext) {
      return nextProps.model.hashCode() !== this.props.model.hashCode();
    },
    render: function () {
      var body = React.createElement('rect', {
        x: this.props.model.get('x'),
        y: this.props.model.get('y'),
        width: this.props.model.get('width'),
        height: this.props.model.get('height'),
        stroke: '#d4d1ca',
        fill: '#f7eedc',
        rx: 3,
        ry: 3,
        key: -1
      });
      var holes = this.props.model.getIn(['holes'])
        .map(function (hole) {
          return React.createElement(partHole.class(), {
            model: hole,
            key: hole.get('key')
          });
        }).toArray();
      return React.createElement('g', null, [body].concat(holes));
    }
  });

  var breadboardProto = function (model) {
    var thisProto = Object.create(null);
    thisProto.model = function () {
      return model;
    };
    thisProto.setX = function (x) {
      model = model.set('x', x);
      return this.updateParts();
    };
    thisProto.setY = function (y) {
      model = model.set('y', y);
      return this.updateParts();
    };
    thisProto.setXY = function (x, y) {
      model = model.set('x', x);
      model = model.set('y', y);
      return this.updateParts();
    };
    thisProto.updateParts = function () {
      var x = model.get('x'),
        y = model.get('y'),
        columnCount = model.get('columnCount'),
        rowCount = model.get('rowCount'),
        margine = 10,
        columnDistance = 10,
        rowDistance = 10,
        holes = [];

      for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        for (var columnIndex = 0; columnIndex < columnCount; columnIndex++) {
          var currentHoleIndex = rowIndex * rowCount + columnIndex,
            newHole = partHole.model().objectify()
            .setXY(x + margine + columnIndex * columnDistance, y + margine + rowIndex * rowDistance)
            .model();
          holes.push(newHole);
        }
      }
      model = model.set('holes', Immutable.fromJS(holes));

      model = model.set('width', (columnCount - 1) * columnDistance + 2 * margine);
      model = model.set('height', (rowCount - 1) * rowDistance + 2 * margine);

      return this;
    };
    thisProto.keyify = function () {
      model = model.set('key', KeyProvider());
      model = dissect(model,
        update('holes', function (hole) {
          return hole.objectify()
            .keyify(KeyProvider)
            .model();
        })
      );
      return this;
    };
    thisProto.init = function () {
      return this.updateParts();
    };
    return thisProto;
  };

  var breadboardModel = Immutable.fromJS({
    name: 'breadboard',
    x: 100,
    y: 300,
    columnCount: 30,
    rowCount: 15,
    width: 20,
    height: 60,
    holes: [],
    proto: breadboardProto
  });

  var breadboard = breadboardProto(breadboardModel);
  breadboardModel = breadboard
    .init()
    .model();

  return {
    name: function () {
      return breadboardModel.get('name');
    },
    class: function () {
      return breadboardClass;
    },
    proto: function () {
      return breadboardProto;
    },
    model: function () {
      return breadboardModel.objectify()
        .keyify(KeyProvider)
        .model();
    }
  };
});