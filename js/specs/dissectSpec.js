/* global define, require, describe, it, xit, expect, dissect, update, updateAll, filter, where */


define(['app/dissect', 'immutable.min', 'immutable.cursor'], function (Dissect, Immutable, Cursor) {
  describe('Dissect module', function () {
    it('should make all its functions available as globals too', function () {
      expect(Dissect.dissect).toBe(dissect);
      expect(Dissect.update).toBe(update);
      expect(Dissect.updateAll).toBe(updateAll);
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

  describe('update', function () {
    it('should return a wrapper function', function () {
      var wrapper = update('key', noOpTransform);
      expect(typeof (wrapper)).toBe('function');
    });

    describe('update`s returned wrapper', function () {
      it('should apply a transform on the parent[key] value', function () {
        var wrapper = update('key', toUpperCaseTransform),
          parent = Immutable.fromJS({
            key: 'Value'
          }),
          transformedParent = wrapper(parent);
        expect(transformedParent.get('key')).toBe('VALUE');
      });

      it('should apply a list of transforms on the parent[key] value', function () {
        var wrapper = update('key', [toUpperCaseTransform, doubleValueTransform]),
          parent = Immutable.fromJS({
            key: 'Value'
          }),
          transformedParent = wrapper(parent);
        expect(transformedParent.get('key')).toBe('VALUEVALUE');
      });

      it('should do nothing when parent[key] doesn`t exist', function () {
        var wrapper = update('invalidKey', toUpperCaseTransform),
          parent = Immutable.fromJS({
            key: 'Value'
          }),
          transformedParent = wrapper(parent);
        expect(transformedParent.get('key')).toBe('Value');
        expect(transformedParent).toBe(parent);
      });
    });
  });

  describe('updateAll', function () {
    it('should return a wrapper function', function () {
      var wrapper = updateAll('key', noOpTransform);
      expect(typeof (wrapper)).toBe('function');
    });

    describe('updateAll`s returned wrapper', function () {
      it('should apply a transform on each of the parent[key] items', function () {
        var wrapper = updateAll('key', toUpperCaseTransform),
          parent = Immutable.fromJS({
            key: ['a', 'b']
          }),
          transformedParent = wrapper(parent);
        expect(transformedParent.getIn(['key', 0])).toBe('A');
        expect(transformedParent.getIn(['key', 1])).toBe('B');
      });

      it('should apply a list of transforms on each of the parent[key] items', function () {
        var wrapper = updateAll('key', [toUpperCaseTransform, doubleValueTransform]),
          parent = Immutable.fromJS({
            key: ['a', 'b']
          }),
          transformedParent = wrapper(parent);
        expect(transformedParent.getIn(['key', 0])).toBe('AA');
        expect(transformedParent.getIn(['key', 1])).toBe('BB');
      });

      it('should do nothing when parent[key] doesn`t exist', function () {
        var wrapper = updateAll('invalidKey', toUpperCaseTransform),
          parent = Immutable.fromJS({
            key: 'Value'
          }),
          transformedParent = wrapper(parent);
        expect(transformedParent.get('key')).toBe('Value');
        expect(transformedParent).toBe(parent);
      });
    });
  });

  var noTest = function (value) {
      return true;
    },
    oddTest = function (value) {
      return value % 2 === 1;
    },
    incrementTransform = function (value) {
      return value + 1;
    };

  describe('where', function () {
    it('should return a wrapper function', function () {
      var wrapper = where(noTest, noOpTransform);
      expect(typeof (wrapper)).toBe('function');
    });

    describe('where`s returned wrapper', function () {
      it('should apply a transform on a value if the test passes', function () {
        var wrapper = where(oddTest, incrementTransform),
          value = 1,
          transformedValue = wrapper(value);
        expect(transformedValue).toBe(value + 1);
      });

      it('should apply a list transforms on a value if the test passes', function () {
        var wrapper = where(oddTest, [incrementTransform, doubleValueTransform]),
          value = 1,
          transformedValue = wrapper(value);
        expect(transformedValue).toBe((value + 1) * 2);
      });

      it('should not apply a transform if the test don`t pass', function () {
        var wrapper = where(oddTest, incrementTransform),
          value = 2,
          transformedValue = wrapper(value);
        expect(transformedValue).toBe(value);
      });

      it('should not work with a list of tests', function () {
        // dealing with a list of tests is ambiguouse because it's not clear how the test results are merged (or?, and?)
        var wrapper = where([oddTest, noTest], incrementTransform),
          caller = function () {
            wrapper(0);
          };
        expect(caller).toThrow();
      });
    });
  });

  describe('filter', function () {
    it('should return a wrapper function', function () {
      var wrapper = filter('key', oddTest);
      expect(typeof (wrapper)).toBe('function');
    });

    describe('filter`s returned wrapper', function () {
      it('should return a new collection containing only the values that passed the test', function () {
        var wrapper = filter('key', oddTest),
          collection = Immutable.fromJS({
            key: [0, 1, 2, 3]
          }),
          filteredCollection = wrapper(collection),
          list = filteredCollection.get('key');
        expect(list.contains(0)).toBe(false);
        expect(list.contains(1)).toBe(true);
        expect(list.contains(2)).toBe(false);
        expect(list.contains(3)).toBe(true);
      });

      it('should return an empty collection if no value passed the test', function () {
        var wrapper = filter('key', oddTest),
          collection = Immutable.fromJS({
            key: [0, 2, 4, 6]
          }),
          filteredCollection = wrapper(collection),
          list = filteredCollection.get('key');
        expect(list.count()).toBe(0);
      });

      it('should not work when the key is not refering to an array', function () {
        var wrapper = filter('key', oddTest),
          collection = Immutable.fromJS({
            key: 'value'
          }),
          caller = function () {
            wrapper(collection);
          };
        expect(caller).toThrow();
      });

      it('should not work with a list of tests', function () {
        // dealing with a list of tests is ambiguouse because it's not clear how the test results are merged (or?, and?)
        var wrapper = filter('key', [oddTest, noTest]),
          collection = Immutable.fromJS({
            key: [0, 1, 2, 3]
          }),
          caller = function () {
            wrapper(collection);
          };
        expect(caller).toThrow();
      });
    });
  });

});