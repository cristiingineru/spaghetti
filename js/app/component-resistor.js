/* global define, require, dissect, update, updateAll */


define(['React', 'react.draggable', 'immutable.min', 'app/core', 'app/layoutManager', 'app/part-leg', 'app/part-body'], function (React, Draggable, Immutable, Core, LayoutManager, partLeg, partBody) {

  var resistorClass = React.createClass({
    displayName: 'resistor',
    getDefaultProps: function () {
      return {
        model: null
      };
    },
    render: function () {

      var eventHandler = LayoutManager.componentEventHandler(this.props.model);

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
      // this wrappers are required to make the react.draggable work
      var bodyWrapper = React.createElement('g', {
        onMouseUp: eventHandler.onMouseUp
      }, body);
      var bodySecondWrapper = React.createElement('g', null, bodyWrapper);
      var draggableBody = React.createElement(Draggable, {
        axis: 'both',
        onStart: eventHandler.onDragStart,
        onDrag: eventHandler.onDrag,
        onStop: eventHandler.onDragStop
      }, bodySecondWrapper);
      return React.createElement('g', null, [leg1, leg2, draggableBody]);
    }
  });

  var resistorProto = function (model) {
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
      var x = model.get('x');
      var y = model.get('y');

      var body = model.getIn(['body']).objectify()
        .setXY(x, y)
        .setWidth(20)
        .setHeight(40)
        .model();
      model = model.set('body', body);

      var leg0 = model.getIn(['legs', 0]).objectify()
        .setXY(x + 10, y)
        .setDirection('up')
        .model();
      var leg1 = model.getIn(['legs', 1]).objectify()
        .setXY(x + 10, y + 40)
        .setDirection('down')
        .model();
      var legs = Immutable.fromJS([leg0, leg1]);
      model = model.set('legs', legs);

      return this;
    };
    thisProto.keyify = function (keyProvider) {
      var key = keyProvider();
      model = model.set('key', key);
      model = dissect(model,
        updateAll('legs', function (leg) {
          return leg.objectify()
            .keyify(keyProvider)
            .model();
        })
      );
      model = dissect(model,
        update('body', function (body) {
          return body.objectify()
            .keyify(keyProvider)
            .model();
        })
      );
      return this;
    };
    thisProto.select = function (value) {
      model = model.set('selected', value);
      return this;
    };
    thisProto.init = function () {
      return this.updateParts();
    };
    return thisProto;
  };

  var resistorModel = Immutable.fromJS({
    name: 'resistor',
    x: 0,
    y: 0,
    body: partBody.model(),
    legs: [partLeg.model(), partLeg.model()],
    proto: resistorProto
  });

  var resistor = resistorProto(resistorModel);
  resistorModel = resistor
    .init()
    .model();

  return {
    name: function () {
      return resistorModel.get('name');
    },
    class: function () {
      return resistorClass;
    },
    proto: function () {
      return resistorProto;
    },
    model: function () {
      return resistorModel;
    }
  };
});