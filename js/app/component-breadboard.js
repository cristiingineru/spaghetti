/* global define, require */


define(['React', 'react.draggable', 'immutable.min', 'app/core', 'app/part-hole'], function (React, Draggable, Immutable, Core, partHole) {

  var breadboardClass = React.createClass({
    displayName: 'component-resistor',
    getDefaultProps: function () {
      return {
        model: null
      };
    },
    render: function () {
      var leg1 = React.createElement(partLeg.class(), {
        model: this.props.model.getIn(['legs', 0]),
        owner: this.props.model
      });
      var leg2 = React.createElement(partLeg.class(), {
        model: this.props.model.getIn(['legs', 1]),
        owner: this.props.model
      });
      var body = React.createElement(partBody.class(), {
        model: this.props.model.get('body'),
        owner: this.props.model
      });
      return React.createElement('g', null, [leg1, leg2, body]);
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
        columnDistance = 10,
        rowDistance = 10;

      
      var holes = model.getIn(['holes']).deref();
      
      .cursor().objectify()
        .setXY(x, y)
        .setWidth(20)
        .setHeight(40)
        .model();
      model = model.set('body', body.deref());


      return this;
    };
    thisProto.init = function () {
      var columnCount = model.get('columnCount'),
        rowCount = model.get('rowCount'),
        holes = [];
      for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        for (var columnIndex = 0; columnIndex < columnCount; columnIndex++) {
          var hole = partHole.model().deref().cursor().objectify()
            .setRow(rowIndex)
            .setColumn(columnIndex)
            .model();
          holes.push(hole);
        }
      }
      model.set('holes', holes);
      return this.updateParts();
    };
    return thisProto;
  };

  var breadboardModel = Immutable.fromJS({
    name: 'breadboard',
    x: 100,
    y: 300,
    columnCount: 30,
    rowCount: 10,
    holes: [],
    proto: breadboardProto
  });

  var breadboard = breadboardProto(breadboardModel.cursor());
  breadboardModel = breadboard
    .init()
    .model().deref();

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
      return breadboardModel;
    }
  };
});