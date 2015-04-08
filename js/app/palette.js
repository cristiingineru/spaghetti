/* global define, require */


define(['React', 'immutable.min', 'app/catalog'], function (React, Immutable, Catalog) {

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
      var models = this.props.model.getIn(['components']);
      for (var i = 0; i < models.count(); i++) {
        var model = models.getIn([i]);
        var component = React.createElement(ClassProvider(model), {
          model: model
        });
        components.push(component);
      }
      return React.createElement('g', null, [palette].concat(components));
    }
  });

  var paletteProto = function (model) {
    var thisProto = Object.create(null);
    thisProto.model = function () {
      return model;
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
      var newComponents = model.getIn(['components']).withMutations(function (cs) {
        cs.push(component);
      });
      model = model.set('components', newComponents);
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
    width: '400',
    height: '150',
    components: components,
    proto: paletteProto
  });

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
    }
  };
});