/* global define, require */


define(['React', 'immutable.min', 'app/core', 'app/component-catalog'], function (React, Immutable, Core, Catalog) {

  var diagramClass = React.createClass({
    displayName: 'diagram',
    getDefaultProps: function () {
      return {
        model: null
      };
    },
    render: function () {
      var LayoutManager = require('app/layoutManager');
      var handlerAdapter = LayoutManager.myHandlerAdapter(this.props.model);
      var rect = React.createElement('rect', {
        x: this.props.model.get('x'),
        y: this.props.model.get('y'),
        width: this.props.model.get('width'),
        height: this.props.model.get('height'),
        stroke: '#AAAAAA',
        fill: '#f4f4f4',
        onClick: handlerAdapter.onDiagramClickHandler
      });
      var components = [];
      var models = this.props.model.getIn(['components']);
      for (var i = 0; i < models.count(); i++) {
        var model = models.getIn([i]);
        var component = React.createElement(Catalog(model).class(), {
          model: model
        });
        components.push(component);
      }
      return React.createElement('g', null, [rect].concat(components));
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
      var newComponents = model.getIn(['components']).deref().withMutations(function (cs) {
        cs.push(component);
      });
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