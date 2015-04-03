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
      var stripModels = this.props.model.get('strips');
      var strips = stripModels.map(function (stripModel) {
        return React.createElement(Strip.class(), {
          model: stripModel
        });
      });
      return React.createElement('g', null, strips);
    }
  });

  var unitSize = 14,
    getGroupDescriptions = function (row) {
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
    getRowDescription = function (row) {
      return {
        groupDescriptions: getGroupDescriptions(row)
      };
    },
    getDescription = function (pattern) {
      var rows = pattern.split('\n');
      var rowDescriptions = rows.map(function (row) {
        return getRowDescription(row);
      });
      return {
        rowDescriptions: rowDescriptions
      };
    },
    buildGroup = function (groupDescription, x, y) {
      var count = groupDescription.count,
        stripSize = groupDescription.stripSize,
        stripOrientation = groupDescription.stripOrientation,
        strip = Strip.model().objectify()
        .setHoleCount(groupDescription.stripSize)
        .setOrientation(groupDescription.stripOrientation)
        .model(),
        strips = [],
        groupStyle = stripOrientation === 'horizontal' ? 'long' : 'short',
        horizontalIncrementer = groupStyle === 'short' ? unitSize : (unitSize * stripSize);
      for (var index = 0; index < count; index++) {
        var newStrip = strip.objectify()
          .setXY(x + index * horizontalIncrementer, y)
          .model();
        strips.push(newStrip);
      }
      return {
        strips: strips,
        width: groupStyle === 'short' ? count * unitSize : stripSize * unitSize,
        height: groupStyle === 'long' ? unitSize : stripSize * unitSize
      };
    },
    buildRow = function (rowDescription, y) {
      var strips = [],
        maxHeight = 0,
        width = 0;

      rowDescription.groupDescriptions.forEach(function (groupDescription) {
        var groupResult = buildGroup(groupDescription, width, y);
        strips = strips.concat(groupResult.strips);
        width += groupResult.width;
        if (groupResult.height > maxHeight) {
          maxHeight = groupResult.height;
        }
      });

      return {
        strips: strips,
        height: Math.max(maxHeight, unitSize)
      };
    },
    build = function (description) {
      var strips = [],
        height = 0;

      description.rowDescriptions.forEach(function (rowDescription) {
        var rowResult = buildRow(rowDescription, height);
        strips = strips.concat(rowResult.strips);
        height += rowResult.height;
      });

      return {
        strips: strips,
        height: height
      };
    },
    strips = function (pattern) {
      var description = getDescription(pattern),
        result = build(description);

      return Immutable.fromJS(result.strips);
    };

  var breadboardProto = function (model) {
    var thisProto = Object.create(null);
    thisProto.model = function () {
      return model;
    };
    thisProto.setXY = function (x, y) {
      return this.moveTo(x, y);
    };
    thisProto.pattern = function (pattern) {
      model = model.set('strips', strips(pattern));
      return this.updateParts();
    };
    thisProto.updateParts = function () {
      var strips = model.get('strips'),
        width = 0,
        height = 0;
      strips.forEach(function (strip) {
        strip.get('holes').forEach(function (hole) {
          width = Math.max(width, hole.get('x'));
          height = Math.max(height, hole.get('y'));
        });
      });
      model = model.set('width', width)
        .set('height', height);
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
      return this;
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
    return thisProto;
  };

  var breadboardModel = Immutable.fromJS({
    name: 'breadboard',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
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
      var defaultBreadboardPattern = [
        '1*60h',
        '1*60h',
        '',
        '',
        '',
        '60*5v',
        '',
        '',
        '60*5v',
        '',
        '',
        '',
        '1*60h',
        '1*60h'
      ].join('\n');
      pattern = pattern || defaultBreadboardPattern;
      var newBreadboard = breadboardProto(breadboardModel);
      var newBreadboardModel = newBreadboard
        .pattern(pattern)
        .model();
      return newBreadboardModel;
    }
  };
});