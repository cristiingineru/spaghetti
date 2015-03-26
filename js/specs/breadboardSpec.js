/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine */


define(['app/component-breadboard', 'Squire', 'immutable.min', 'app/layoutManager', 'React', 'app/part-leg', 'app/part-body', 'mocks/bodyMock'], function (Breadboard, Squire, Immutable, LayoutManager, React, Leg, Body, BodyMock) {
  describe('Breadboard', function () {
    it('should provide a known API', function () {
      expect(typeof (Breadboard.name)).toBe('function');
      expect(typeof (Breadboard.name())).toBe('string');

      expect(typeof (Breadboard.class)).toBe('function');
      expect(Breadboard.class).not.toThrow();

      expect(typeof (Breadboard.proto)).toBe('function');
      expect(Breadboard.proto).not.toThrow();

      expect(typeof (Breadboard.model)).toBe('function');
      expect(Breadboard.model).not.toThrow();
    });

    describe('Breadboard class', function () {

    });

    describe('Breadboard proto', function () {
      it('should have a keyify function that set a unique key to itself and child parts', function () {
        var hardCodedUniqueKey = 9999;
        var keyProvider = jasmine.createSpy('keyProvider').and.returnValue(hardCodedUniqueKey);
        var breadboard = Breadboard.model().objectify()
          .keyify(keyProvider)
          .model();
        expect(keyProvider.calls.count()).toBeGreaterThan(3);
      [
        breadboard.get('key'),
        //resistor.getIn(['body', 'key']),
        //resistor.getIn(['legs', '0', 'key']),
        //resistor.getIn(['legs', '1', 'key'])
      ].forEach(function (key) {
          expect(key).toBe(hardCodedUniqueKey);
        });
      });

      it('should have an init function that personalize the child parts', function (done) {
        var squire = new Squire()
          .mock('app/part-body', BodyMock)
          .require(['app/component-resistor'], function (Resistor2) {
            var resistor = Resistor2.model().objectify()
              .init()
              .model();
            //var bodyProto = resistor.get('body').objectify();
            //expect(bodyProto.setXY).toHaveBeenCalled();
            //expect(bodyProto.setWidth).toHaveBeenCalled();
            //expect(bodyProto.setHeight).toHaveBeenCalled();
            done();
          });
      });
    });

    describe('Breadboard model', function () {
      it('should be an immutable map', function () {
        var model = Breadboard.model();
        expect(Immutable.Map.isMap(model)).toBe(true);
      });

      it('should have name, proto, x and y properties', function () {
        var model = Breadboard.model();
        expect(model.get('name')).not.toBeFalsy();
        expect(model.get('proto')).not.toBeFalsy();
        expect(model.get('x')).toEqual(jasmine.any(Number));
        expect(model.get('y')).toEqual(jasmine.any(Number));
      });
    });

  });
});