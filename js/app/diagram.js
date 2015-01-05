/* global define */


define(['React', 'immutable.min', 'app/core', 'app/component-catalog'], function (React, Immutable, Core, Catalog) {

  var diagramClass = React.createClass({
    displayName: 'diagram',
    getDefaultProps: function () {
      return {
        model: null
      };
    },
    render: function () {
      var rect = React.createElement('rect', {
        x: 0,
        y: 0,
        width: '100%',
        height: '100%',
        stroke: '#AAAAAA',
        fill: '#ffe0cc'
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

  var diagramModel = Immutable.fromJS({
    x: 0,
    y: 0,
    width: '100%',
    height: '100%',
    components: [],
    addComponent: function (diagram, component) {
      var newComponents = diagram.getIn(['components']).deref().withMutations(function (cs) {
        cs.push(component);
      });
      return diagram.set('components', newComponents);
    },
  });

  return {
    class: function () {
      return diagramClass;
    },
    model: function () {
      return diagramModel;
    }
  };
});