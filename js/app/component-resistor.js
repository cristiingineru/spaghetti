/* global define */


define(['React', 'react.draggable', 'immutable.min', 'app/core', 'app/part-leg', 'app/part-body'], function (React, Draggable, Immutable, Core, partLeg, partBody) {

  var resistorClass = React.createClass({
    displayName: 'component-resistor',
    getDefaultProps: function () {
      return {
        model: null
      };
    },
    render: function () {
      var leg1 = React.createElement(partLeg.class(), {
        model: this.props.model.getIn(['legs', 0])
      });
      var leg2 = React.createElement(partLeg.class(), {
        model: this.props.model.getIn(['legs', 1])
      });
      var body = React.createElement(partBody.class(), {
        model: this.props.model.get('body')
      });
      //return React.createElement('g', null, [leg1, leg2, body]);

      var thisResistor = this;
      var state = this.state || {x: 10, y: 30};
      var handleStart = function (event, ui) {
          console.log('*** START ***');
          console.log('Event: ', event);
          console.log('Position: ', ui.position);
      };

      var handleDrag = function (event, ui) {
          console.log('*** DRAG ***');
          console.log('Event: ', event);
          console.log('Position: ', ui.position);
          state = {x: event.clientX, y: event.clientY};
          thisResistor.setState(state);
      };

      var handleStop = function (event, ui) {
          console.log('*** STOP ***');
          console.log('Event: ', event);
          console.log('Position: ', ui.position);
          state = {x: event.clientX, y: event.clientY};
          thisResistor.setState(state);
      };
      var rect = React.createElement('rect', {
        x: state.x,
        y: state.y,
        width: 30,
        height: 30,
        stroke: '#ceb27a',
        fill: '#E6C88C',
        rx: 4,
        ry: 4,
      });
      console.log('*** resistor to be rendered ***');
      return React.createElement(Draggable, {
          axis: 'both',
          zIndex: 100,
          onStart: handleStart,
          onDrag: handleDrag,
          onStop: handleStop,
        }, rect);
    }
  });

  var resistorModel = Immutable.fromJS({
    x: 0,
    y: 0,
    width: 20,
    height: 40,
    body: partBody.model(),
    legs: [partLeg.model(), partLeg.model()],
    setX: function (resistor, x) {
      resistor = resistor.set('x', x);
      resistor = resistor.get('updateParts')(resistor);
      return resistor;
    },
    setY: function (resistor, y) {
      resistor = resistor.set('y', y);
      resistor = resistor.get('updateParts')(resistor);
      return resistor;
    },
    updateParts: function (resistor) {
      var x = resistor.get('x');
      var y = resistor.get('y');

      var body = resistor.getIn(['body']).deref().cursor().objectify()
        .setX(x)
        .setY(y)
        .setWidth(20)
        .setHeight(40);
      resistor = resistor.set('body', body.deref());

      var leg0 = resistor.getIn(['legs', 0]).deref().cursor().objectify()
        .setX(x + 10)
        .setY(y)
        .setDirection('up');
      var leg1 = resistor.getIn(['legs', 1]).deref().cursor().objectify()
        .setX(x + 10)
        .setY(y + 40)
        .setDirection('down');
      var legs = Immutable.fromJS([leg0.deref(), leg1.deref()]);
      resistor = resistor.set('legs', legs);

      return resistor;
    },
    init: function (resistor) {
      return resistor.get('updateParts')(resistor);
    },
    getName: function (resistor) {
      return 'resistor';
    }
  });
  resistorModel = resistorModel.cursor();
  resistorModel = resistorModel.get('init')(resistorModel).deref();

  return {
    name: function () {
      return resistorModel.get('getName')();
    },
    class: function () {
      return resistorClass;
    },
    model: function () {
      return resistorModel;
    }
  };
});