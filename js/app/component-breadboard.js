/* global define, require, dissect, update, updateAll */


define(['React', 'react.draggable', 'immutable.min', 'app/core', 'app/part-hole', 'app/part-strip'], function (React, Draggable, Immutable, Core, partHole, Strip) {

  var breadboardClass = React.createClass({
    displayName: 'breadboard',
    getDefaultProps: function () {
      return {
        model: null
      };
    },
    shouldComponentUpdate: function (nextProps, nextState, nextContext) {
      return nextProps.model.hashCode() !== this.props.model.hashCode();
    },
    render: function () {
      /*
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
      */

      var stripModels = this.props.model.get('strips');
      var strips = stripModels.map(function (stripModel) {
        return React.createElement(Strip.class(), {
          model: stripModel
        });
      });

      /*
      var stripModel = Strip.model().objectify()
        .setXY(this.props.model.get('x'), this.props.model.get('y'))
        .setOrientation('horizontal')
        .setHoleCount(5)
        .model(),
        strip = React.createElement(Strip.class(), {
          model: stripModel
        });
        */

      return React.createElement('g', null, strips);
    }
  });

  var findGroupDescriptions = function (row) {
      var groupPattern = /((\d+)\*)?((\d+)(v|h))/g,
        match = groupPattern.exec(row),
        groups = [];
      while (match) {
        groups.push({
          count: Number(match[2] || 1),
          stripSize: Number(match[4]),
          stripOrientation: match[5] === 'h' ? 'horizontal' : 'vertical'
        });
        match = groupPattern.exec(row);
      }
      return groups;
    },
    buildStrips = function (groupDescription) {
      var strip = Strip.model().objectify()
        .setHoleCount(groupDescription.stripSize)
        .setOrientation(groupDescription.stripOrientation)
        .model();
      var stripsOfTheGroup = [];
      for (var i = 0; i < groupDescription.count; i++) {
        stripsOfTheGroup.push(strip);
      }
      return stripsOfTheGroup;
    },
    distributeEvenly = function (strips, groupOrientation, stripWidth) {
      var horizontalIncrementer = groupOrientation === 'horizontal' ? stripWidth : 0,
        verticalIncrementer = groupOrientation === 'vertical' ? stripWidth : 0;
      return strips.map(function (strip, index) {
        var x = strip.get('x'),
          y = strip.get('y'),
          newX = x + index * horizontalIncrementer,
          newY = y + index * verticalIncrementer;
        return strip.objectify()
          .setXY(newX, newY)
          .model();
      });
    },
    strips = function (pattern) {
      var groupDescription = findGroupDescriptions(pattern)[0],
        newStrips = buildStrips(groupDescription);

      var groupOrientation = groupDescription.stripOrientation === 'vertical' ? 'horizontal' : 'vertical',
        stripWidth = 10;
      newStrips = distributeEvenly(newStrips, groupOrientation, stripWidth);

      return Immutable.fromJS(newStrips);
    };

  var breadboardProto = function (model) {
    var thisProto = Object.create(null);
    thisProto.model = function () {
      return model;
    };
    thisProto.setXY = function (x, y) {
      this.moveTo(x, y);
      model = model.set('x', x); // TODO: delete
      model = model.set('y', y); // TODO: delete
      return this.updateParts(); // TODO: delete
    };
    thisProto.pattern = function (pattern) {
      model = model.set('strips', strips(pattern));
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

      //model = model.set('width', (columnCount - 1) * columnDistance + 2 * margine);
      //model = model.set('height', (rowCount - 1) * rowDistance + 2 * margine);

      return this;
    };
    thisProto.moveTo = function (x, y) {
      var originalBreadboardX = model.get('x'),
        originalBreadboardY = model.get('y'),
        deltaX = x - originalBreadboardX,
        deltaY = y - originalBreadboardY;
      var strips = model.get('strips').map(function (strip) {
        var originalX = strip.get('x'),
          originalY = strip.get('y'),
          newX = originalX + deltaX,
          newY = originalY + deltaY;

        return strip.objectify()
          .setXY(newX, newY)
          .model();
      });
      model = model.set('strips', strips);
    };
    thisProto.keyify = function (keyProvider) {
      model = model.set('key', keyProvider());
      model = dissect(model,
        updateAll('holes', function (hole) {
          return hole.objectify()
            .keyify(keyProvider)
            .model();
        })
      );
      return this;
    };
    thisProto.init = function () {
      return this.updateParts(); // TODO: delete
    };
    return thisProto;
  };

  var breadboardModel = Immutable.fromJS({
    name: 'breadboard',
    x: 0,
    y: 0,
    columnCount: 30,
    rowCount: 15,
    //width: 20,
    //height: 60,
    holes: [],
    strips: [],
    proto: breadboardProto
  });

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
    model: function (pattern) {
      var defaultBreadboardPattern = '30*5v';
      pattern = pattern || defaultBreadboardPattern;
      var newBreadboard = breadboardProto(breadboardModel);
      var newBreadboardModel = newBreadboard
        .init()
        .pattern(pattern)
        .model();
      return newBreadboardModel;
    }
  };
});