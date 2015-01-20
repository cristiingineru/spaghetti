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

  describe('dissect', function () {
    it('should apply a function on an immutable root', function () {});

    it('should apply a function on a cursor', function () {});
  });

  describe('select', function () {
    it('should return a wrapper function', function () {
      var transform = function (value) {},
        wrapper = select('key', transform);
      expect(typeof (wrapper)).toBe('function');
    });

    describe('select`s returned wrapper', function () {
      it('should apply a transform on the parent[key] value', function () {
        var transform = function (value) {
            return 'newValue';
          },
          wrapper = select('key', transform),
          parent = Immutable.fromJS({
            key: 'value'
          }),
          transformedParent = wrapper(parent);
        expect(transformedParent.get('key')).toBe('newValue');
      });

      it('should apply a list of transforms on the parent[key] value', function () {
        var transform1 = function (value) {
            return 'newValue1';
          },
          transform2 = function (value) {
            return 'newValue2';
          },
          wrapper = select('key', [transform1, transform2]),
          parent = Immutable.fromJS({
            key: 'value'
          }),
          transformedParent = wrapper(parent);
        expect(transformedParent.get('key')).toBe('newValue2');
      });

      it('should apply a transform on each of the parent[key] items when parent[key] is a list', function () {
        var transform = function (value) {
            return value.toUpperCase();
          },
          wrapper = select('key', transform),
          parent = Immutable.fromJS({
            key: ['a', 'b']
          }),
          transformedParent = wrapper(parent);
        expect(transformedParent.getIn(['key', 0])).toBe('A');
        expect(transformedParent.getIn(['key', 1])).toBe('B');
      });

      it('should apply a list of transform on each of the parent[key] items when parent[key] is a collection', function () {
        var transform1 = function (value) {
            return value.toUpperCase();
          },
          transform2 = function (value) {
            return value + value;
          },
          wrapper = select('key', [transform1, transform2]),
          parent = Immutable.fromJS({
            key: ['a', 'b']
          }),
          transformedParent = wrapper(parent);
        expect(transformedParent.getIn(['key', 0])).toBe('AA');
        expect(transformedParent.getIn(['key', 1])).toBe('BB');
      });

      it('should do nothing when parent[key] doesn`t exist', function () {
        var transform = function (value) {
            return 'newValue';
          },
          wrapper = select('invalidKey', transform),
          parent = Immutable.fromJS({
            key: 'value'
          }),
          transformedParent = wrapper(parent);
        expect(transformedParent.get('key')).toBe('value');
        expect(transformedParent).toBe(parent);
      });
    });
  });
});