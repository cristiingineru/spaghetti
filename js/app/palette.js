/* global define, require, dissect, updateAll */


define(['React', 'immutable.min', 'app/catalog', 'app/core'], function (React, Immutable, Catalog, Core) {

  var paletteItemClass = React.createClass({
    displayName: 'paletteItem',
    getDefaultProps: function () {
      return {
        model: null,
        owner: null
      };
    },
    render: function () {
      var LayoutManager = require('app/layoutManager');
      var eventHandler = LayoutManager.paletteItemEventHandler(this.props.model, this.props.owner);
      return React.createElement('rect', {
        x: this.props.model.get('x'),
        y: this.props.model.get('y'),
        width: this.props.model.get('width'),
        height: this.props.model.get('height'),
        className: 'paletteItem',
        onMouseDown: eventHandler.onMouseDown
      });
    }
  });

  var paletteClass = React.createClass({
    displayName: 'palette',
    getDefaultProps: function () {
      return {
        model: null
      };
    },
    render: function () {
      var palette = React.createElement('rect', {
        x: this.props.model.get('x'),
        y: this.props.model.get('y'),
        width: this.props.model.get('width'),
        height: this.props.model.get('height'),
        className: 'palette'
      });
      var ClassProvider = require('app/classProvider');
      var components = [];
      var handlers = [];
      var models = this.props.model.getIn(['components']);
      for (var i = 0; i < models.count(); i++) {
        var model = models.getIn([i]);
        var component = React.createElement(ClassProvider(model), {
          model: model
        });
        components.push(component);
        var handler = React.createElement(paletteItemClass, {
          model: model.get('handler'),
          owner: model
        });
        handlers.push(handler);
      }
      return React.createElement('g', null, [palette].concat(components).concat(handlers));
    }
  });

  var spreadEvenly = function (components, x, y, width, height) {
    var step = width / components.count();
    return components.map(function (component, index) {
      var componentWidth = 20,
        componentHeight = 100,
        handler = Immutable.fromJS({
          x: x + index * step,
          y: y,
          width: step,
          height: height
        });
      return component.objectify()
        .setXY(x + (index + 0.5) * step - componentWidth / 2,
          y + componentHeight / 2)
        .model()
        .set('handler', handler);
    });
  };

  var paletteProto = function (model) {
    var thisProto = Object.create(null);
    thisProto.model = function () {
      return model;
    };
    thisProto.setXY = function (x, y) {
      model = model.set('x', x);
      model = model.set('y', y);
      return this.updateComponents();
    };
    thisProto.setWidth = function (width) {
      model = model.set('width', width);
      return this;
    };
    thisProto.setHeight = function (height) {
      model = model.set('height', height);
      return this;
    };
    thisProto.init = function () {
      return this.updateComponents();
    };
    thisProto.updateComponents = function () {
      var newComponents = spreadEvenly(
        model.get('components'),
        model.get('x'),
        model.get('y'),
        model.get('width'),
        model.get('height'));
      model = model.set('components', newComponents);
      return this;
    };
    thisProto.keyify = function (keyProvider) {
      model = model.set('key', keyProvider());
      model = dissect(model,
        updateAll('components', function (component) {
          return component.objectify()
            .keyify(keyProvider)
            .model();
        })
      );
      return this;
    };
    return thisProto;
  };

  var components = Catalog().map(function (component) {
    return component.model();
  });

  var paletteModel = Immutable.fromJS({
    name: 'palette',
    x: 0,
    y: 0,
    width: 400,
    height: 150,
    components: components,
    proto: paletteProto
  });

  var palette = paletteProto(paletteModel);
  paletteModel = palette
    .init()
    .model();

  return {
    name: function () {
      return paletteModel.get('name');
    },
    class: function () {
      return paletteClass;
    },
    proto: function () {
      return paletteProto;
    },
    model: function () {
      return paletteModel;
    },
    paletteItemClass: function () {
      return paletteItemClass;
    }
  };
});