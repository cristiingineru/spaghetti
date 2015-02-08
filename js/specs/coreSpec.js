/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine */


define(['app/core', 'immutable.min', 'immutable.cursor', 'Squire'], function (Core, Immutable, Cursor, Squire) {
  describe('Core', function () {
    it('should decorate the Immutable.List and Immutable.Map prototypes with a cursor() function', function (done) {
      expect(Immutable.List.prototype.cursor).not.toBeFalsy();
      expect(Immutable.Map.prototype.cursor).not.toBeFalsy();
      var noOpCoreMock = null;
      var squire = new Squire()
        .mock('app/core', noOpCoreMock)
        .require(['immutable.min'], function (Immutable2) {
          expect(Immutable2.List.prototype.cursor).toBeFalsy();
          expect(Immutable2.Map.prototype.cursor).toBeFalsy();
          done();
        });
    });

    describe('Immutable.List.cursor() and Immutable.Map.cursor()', function () {
      var isCursor = function (object) {
        if (object && object.deref) {
          return true;
        }
        return false;
      };
      it('should return a cursor', function () {
        var collections = [
          Immutable.List().set(0, 'randomValue'),
          Immutable.Map().set(10, 'anotherRandomValue')
        ];
        collections.forEach(function (collection) {
          var cursor = collection.cursor();
          expect(isCursor(cursor)).toBe(true);
        });
      });
    });

    it('should decorate the Immutable.Seq and Immutable.Map prototypes with an objectify() function', function (done) {
      expect(Immutable.Seq.prototype.objectify).not.toBeFalsy();
      expect(Immutable.Map.prototype.objectify).not.toBeFalsy();
      var noOpCoreMock = null;
      var squire = new Squire()
        .mock('app/core', noOpCoreMock)
        .require(['immutable.min'], function (Immutable2) {
          expect(Immutable2.Seq.prototype.objectify).toBeFalsy();
          expect(Immutable2.Map.prototype.objectify).toBeFalsy();
          done();
        });
    });

    describe('Immutable.Seq.objectify() and Immutable.Map.objectify()', function () {
      it('should throw if the collection does not contain a `proto` key', function () {
        var collections = [
          Immutable.fromJS([0, 1, 2]).toSeq(),
          Immutable.Map().set(10, 'anotherRandomValue')
        ];
        collections.forEach(function (collection) {
          expect(collection.objectify).toThrow();
        });
      });

      it('should let the `proto` value to create an object', function () {
        var proto = jasmine.createSpy().and.returnValue({});
        var collections = [
          Immutable.fromJS({
            proto: proto
          }).toSeq(),
          Immutable.Map().set('proto', proto)
        ];
        collections.forEach(function (collection) {
          var object = collection.objectify();
          expect(object).not.toBeFalsy();
          expect(proto).toHaveBeenCalledWith(collection);
        });
      });
    });
  });
});