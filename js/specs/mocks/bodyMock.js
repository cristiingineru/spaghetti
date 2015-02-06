/* global define, require, jasmine */

define(['immutable.min', 'app/core'], function (Immutable, Core) {

  var bodyClass = {};

  // These spies are created outside the proto to prevent their re-creation.
  // It's important to reuse the same instances for asserting.
  var setX = jasmine.createSpy('setX'),
    setY = jasmine.createSpy('setY'),
    setXY = jasmine.createSpy('setXY'),
    setWidth = jasmine.createSpy('setWidth'),
    setHeight = jasmine.createSpy('setHeight'),
    keyify = jasmine.createSpy('keyify');
  var bodyProto = function (model) {
    var thisProto = Object.create(null);
    thisProto.model = function () {
      return model;
    };
    thisProto.setX = setX.and.returnValue(thisProto);
    thisProto.setY = setY.and.returnValue(thisProto);
    thisProto.setXY = setXY.and.returnValue(thisProto);
    thisProto.setWidth = setWidth.and.returnValue(thisProto);
    thisProto.setHeight = setHeight.and.returnValue(thisProto);
    thisProto.keyify = jasmine.createSpy('keyify').and.returnValue(thisProto);
    return thisProto;
  };

  var bodyModel = Immutable.fromJS({
    proto: bodyProto
  });

  return {
    class: function () {
      return bodyClass;
    },
    proto: function () {
      return bodyProto;
    },
    model: function () {
      return bodyModel;
    }
  };
});