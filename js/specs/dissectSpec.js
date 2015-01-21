/* global define, require, describe, it, xit, expect, dissect, select, filter, where */


define(['app/dissect', 'immutable.min', 'immutable.cursor'], function (Dissect, Immutable, Cursor) {
  describe('Dissect module', function () {
    it('should make all its functions available as globals too', function () {
      expect(Dissect.dissect).toBe(dissect);
      expect(Dissect.select).toBe(select);
      expect(Dissect.filter).toBe(filter);
      expect(Dissect.where).toBe(where);
    });
  });

  var noOpTransform = function (value) {
      return value.toUpperCase();
    },
    toUpperCaseTransform = function (value) {
      return value.toUpperCase();
    },
    doubleValueTransform = function (value) {
      return value + value;
    };

  describe('dissect', function () {
    it('should apply a wrapped transform on an immutable object', function () {
      var object = Immutable.fromJS({
          key: 'Value'
        }),
        wrapper = function (parent) {
          return parent.update('key', toUpperCaseTransform);
        },
        newObject = dissect(object, wrapper);
      expect(newObject.get('key')).toBe('VALUE');
    });

    it('should apply a wrapped transform on a cursor', function () {
      var object = Immutable.fromJS({
          key: 'Value'
        }),
        cursor = Cursor.from(object),
        wrapper = function (parent) {
          return parent.update('key', toUpperCaseTransform);
        },
        newObject = dissect(object, wrapper);
      expect(newObject.get('key')).toBe('VALUE');
    });
  });

  describe('select', function () {
    it('should return a wrapper function', function () {
      var wrapper = select('key', noOpTransform);
      expect(typeof (wrapper)).toBe('function');
    });

    describe('select`s returned wrapper', function () {
      it('should apply a transform on the parent[key] value', function () {
        var wrapper = select('key', toUpperCaseTransform),
          parent = Immutable.fromJS({
            key: 'Value'
          }),
          transformedParent = wrapper(parent);
        expect(transformedParent.get('key')).toBe('VALUE');
      });

      it('should apply a list of transforms on the parent[key] value', function () {
        var wrapper = select('key', [toUpperCaseTransform, doubleValueTransform]),
          parent = Immutable.fromJS({
            key: 'Value'
          }),
          transformedParent = wrapper(parent);
        expect(transformedParent.get('key')).toBe('VALUEVALUE');
      });

      it('should apply a transform on each of the parent[key] items when parent[key] is a list', function () {
        var wrapper = select('key', toUpperCaseTransform),
          parent = Immutable.fromJS({
            key: ['a', 'b']
          }),
          transformedParent = wrapper(parent);
        expect(transformedParent.getIn(['key', 0])).toBe('A');
        expect(transformedParent.getIn(['key', 1])).toBe('B');
      });

      it('should apply a list of transform on each of the parent[key] items when parent[key] is a collection', function () {
        var wrapper = select('key', [toUpperCaseTransform, doubleValueTransform]),
          parent = Immutable.fromJS({
            key: ['a', 'b']
          }),
          transformedParent = wrapper(parent);
        expect(transformedParent.getIn(['key', 0])).toBe('AA');
        expect(transformedParent.getIn(['key', 1])).toBe('BB');
      });

      it('should do nothing when parent[key] doesn`t exist', function () {
        var wrapper = select('invalidKey', toUpperCaseTransform),
          parent = Immutable.fromJS({
            key: 'Value'
          }),
          transformedParent = wrapper(parent);
        expect(transformedParent.get('key')).toBe('Value');
        expect(transformedParent).toBe(parent);
      });
    });
  });
});