/* global define, require */


define(['React', 'immutable.min', 'app/core'], function (React, Immutable, Core) {

  var diagramClass = React.createClass({
    displayName: 'diagram',
    getDefaultProps: function () {
      return {
        model: null
      };
    },
    render: function () {
      var LayoutManager = require('app/layoutManager'),
        ClassProvider = require('app/classProvider');
      var eventHandler = new LayoutManager.DiagramEventHandler(this.props.model);
      var rect = React.createElement('rect', {
        x: this.props.model.get('x'),
        y: this.props.model.get('y'),
        width: this.props.model.get('width'),
        height: this.props.model.get('height'),
        className: 'diagram',
        onClick: eventHandler.onClick
      });
      var components = this.props.model.getIn(['components']);
      var componentViews = components.map(function (component) {
        return React.createElement(ClassProvider(component), {
          model: component
        });
      }).toArray();
      return React.createElement('g', null, [rect].concat(componentViews));
    }
  });

  var diagramProto = function (model) {
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
    thisProto.setWidth = function (width) {
      model = model.set('width', width);
      return this;
    };
    thisProto.setHeight = function (height) {
      model = model.set('height', height);
      return this;
    };
    thisProto.addComponent = function (component) {
      var newComponents = model.get('components').push(component);
      model = model.set('components', newComponents);
      return this;
    };
    return thisProto;
  };

  var diagramModel = Immutable.fromJS({
    x: 0,
    y: 0,
    width: '100%',
    height: '100%',
    components: [],
    proto: diagramProto
  });

  return {
    class: function () {
      return diagramClass;
    },
    proto: function () {
      return diagramProto;
    },
    model: function () {
      return diagramModel;
    }
  };
});